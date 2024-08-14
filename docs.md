# Prisma & DB setup

npm i -D prisma
npx prisma init

tạo bảng trong schema.pri
npx prisma migrate dev
=> chạy show tables bên cái mysql commanline client
tạo db = create next_lms
=> có url DATABASE_URL="mysql://root:manhkoiii123@@localhost:3306/nextjs_lms" bên env

npm i @prisma/client

tạo libs/db.ts

```ts
import { PrismaClient } from "@prisma/client";
declare global {
  var prisma: PrismaClient | undefined;
}
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
```

tạo schema

```ts
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
model Course {
  id       String   @id @default(cuid())
  userId String
  title String @db.Text
  description String? @db.Text
  imageUrl String? @db.Text
  price Float?
  isPublished Boolean @default(false)
  categoryId String?
  category Category? @relation(fields: [categoryId],references: [id])

  attachments Attachment[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([categoryId])
}

model Attachment {
  id       String   @id @default(cuid())
  name String
  url String @db.Text
  courseId String
  course Course @relation(fields: [courseId],references: [id],onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([courseId])
}
model Category {
  id       String   @id @default(cuid())
  name String @unique
  course Course[]

}
```

xong thì chạy 2 câu lệnh
`npx prisma generate` và `npx prisma db push` là ok

# tạo nhanh category

tạo file script/seed.ts

```ts
const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
  try {
    await database.category.createMany({
      data: [
        {
          name: "Computer Science",
        },
        {
          name: "Music",
        },
        {
          name: "Fitness",
        },
        {
          name: "Photography",
        },
        {
          name: "Accounting",
        },
        {
          name: "Engineering",
        },
        {
          name: "Filming",
        },
      ],
    });
    console.log("success");
  } catch (error) {
    console.log("Error seeding the db categories", error);
  } finally {
    await database.$disconnect();
  }
}
main();
```

sau đó lên terminal chạy node scripts/seed.ts là ok

# react quill

tạo components/editor.tsx

```ts
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill/dist/quill.snow.css";
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}
export const Editor = ({ value, onChange }: EditorProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  return (
    <div className="bg-white ">
      <ReactQuill theme="snow" value={value} onChange={onChange} />
    </div>
  );
};
```

tạo thêm component preview nưa

```ts
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill/dist/quill.bubble.css";
interface PreviewProps {
  value: string;
}
export const Preview = ({ value }: PreviewProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  return (
    <div className="bg-white ">
      <ReactQuill theme="bubble" value={value} readOnly />
    </div>
  );
};
```

# mux

https://dashboard.mux.com/organizations/7j51s0/environments/895cr3/video/assets

vào setting => accestoken => gen token => chọn muxvideo => ấn gen
=> ra 2 cái env

```ts
MUX_TOKEN_ID=f11a3578-3567-4d10-a614-e2cb7c9ac7cd
MUX_TOKEN_SECRET=t0GQPBhkVKht8qrPGZt1wOhC1AgMfTNvCF1PdvGE0hi9oJtnSSEPM+GorvbL1ciMEhGd5BB54AXs
```

chọn vào (video => asestt)
https://dashboard.mux.com/organizations/7j51s0/environments/895cr3/video/assets
install
npm i @mux/mux-node @mux/mux-player-react
vào cái api này api/[chapertId]/route.ts

```ts
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { courseId, chapterId } = params;
    const { isPublished, ...values } = await req.json();
    const ownerCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!ownerCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...values,
      },
    });

    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: chapterId,
        },
      });

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }

      const asset = await mux.video.assets.create({
        input: [{ url: values.videoUrl }],
        playback_policy: ["public"],
        encoding_tier: "baseline",
      });
      await db.muxData.create({
        data: {
          assetId: asset.id,
          chapterId: chapterId,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
```
