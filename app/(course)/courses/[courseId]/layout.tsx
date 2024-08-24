import { getProgress } from "@/actions/get-progress";
import CourseNavbar from "@/app/(course)/courses/[courseId]/_components/CourseNavbar";
import CourseSidebar from "@/app/(course)/courses/[courseId]/_components/CourseSidebar";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    courseId: string;
  };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });
  if (!course) {
    return redirect("/");
  }
  const progressCount = await getProgress(userId, course.id);
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar progressCount={progressCount} course={course} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 ">
        <CourseSidebar progressCount={progressCount} course={course} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};
export default CourseLayout;
