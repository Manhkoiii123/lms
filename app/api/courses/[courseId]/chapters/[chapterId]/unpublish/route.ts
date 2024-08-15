import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
    const ownerCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!ownerCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });
    const muxData = await db.muxData.findUnique({
      where: {
        chapterId,
      },
    });

    const unpublishChapter = await db.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        isPublished: false,
      },
    });
    const publishedChapterIncourse = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
    });
    if (!publishedChapterIncourse.length) {
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return NextResponse.json(unpublishChapter);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
