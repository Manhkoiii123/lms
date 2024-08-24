làm trên khóa này

http://localhost:3000/teacher/courses/clzumm41l0000v7ewros1gih2

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

# Stripe Integration

chọn vào cái new business (iucon store) => new acc
nhìn ở dưới cạnh mấy cái ảnh stripe có cái for dev => 2 cái key lấy cái sercet thôi

```ts
STRIPE_API_KEY =
  sk_test_51PrHMyI7TsYwaUzhSYVWXmIzirYlBmjmhRCS9pjKaMzKahNbwd8Qo2gqtrdt4wtT3O7O5A0pteR9aXSdp5NohKXG00srvpwPzN;
```

npm i stripe

vào lib/stripe.ts

```ts
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});
```

tạo file course/[courseid]/checkout/route.ts

```ts
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const courseId = params.courseId;
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
    });
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });
    if (purchase) {
      return new NextResponse("Already purchased", { status: 400 });
    }
    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: course.title,
            description: course.description!,
          },
          unit_amount: Math.round(course.price!) * 100,
        },
      },
    ];
    let stripeCustomer = await db.stripeCustomer.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
      });
      stripeCustomer = await db.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId: customer.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?canceled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
```

sang docs => ấn sang developers => webhook => test in a local env => lamf theo huong dan

cách làm lách luật =))

chạy cái câu lệnh sau trên command promd
`"D:\stripe_1.21.2_windows_x86_64\stripe.exe" login`

sau đó nó sẽ có cái dòng `Your pairing code is: glad-extol-nobly-sweet`

sau dó chạy bằng câu lệnh `"D:\stripe_1.21.2_windows_x86_64\stripe.exe"  listen --forward-to localhost:3000/api/webhook` => ra 1 cái secrete

thêm vào env

```ts
STRIPE_WEBHOOK_SERCET =
  whsec_da34dc5d86ff3d43d51042d5e0a134578a26e6777b0cf907cd3d3225d9dd4af9;
```

tạo api/webhook/route.ts

```ts
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SERCET!
    );
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Webhook Error", { status: 400 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;
  if (event.type === "checkout.session.completed") {
    if (!userId || !courseId) {
      return new Response("Webhook Error: Missing metadata", { status: 404 });
    }
    await db.purchase.create({
      data: {
        courseId: courseId,
        userId: userId,
      },
    });
  } else {
    return new Response("Webhook Error: Unhandled event type", { status: 200 });
  }
}
```

sử dụng bên cái nút bấm

```ts
"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const CourseEnrollButton = ({
  price,
  courseId,
}: {
  price: number;
  courseId: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const onClick = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.assign(res.data.url);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button onClick={onClick} className="w-full md:w-auto">
      Enroll for {formatPrice(price)}
    </Button>
  );
};

export default CourseEnrollButton;
```

card fake 4242 4242 4242 4242 05/55/555
