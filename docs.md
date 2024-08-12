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
