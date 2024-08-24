import CourseSidebarItem from "@/app/(course)/courses/[courseId]/_components/CourseSidebarItem";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}
const CourseSidebar = async ({ course, progressCount }: CourseSidebarProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((c) => (
          <CourseSidebarItem
            key={c.id}
            id={c.id}
            label={c.title}
            isCompleted={!!c.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!c.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseSidebar;
