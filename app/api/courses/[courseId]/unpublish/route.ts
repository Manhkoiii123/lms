import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = params;

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const updatedCourse = await db.course.update({
      where: {
        id: course.id,
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.log("🚀 ~ PATCH ~ error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
