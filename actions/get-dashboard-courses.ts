import { getProgress } from "@/actions/get-progress";
import { db } from "@/lib/db";
import { Category, Chapter, Course } from "@prisma/client";

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};
type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
};
export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    const purchasedCourses = await db.purchase.findMany({
      where: {
        userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });
    const courses = purchasedCourses.map(
      (p) => p.course
    ) as CourseWithProgressWithCategory[];

    for (let c of courses) {
      const progress = await getProgress(userId, c.id);
      c["progress"] = progress;
    }

    const completedCourses = courses.filter((c) => c.progress === 100);
    const coursesInProgress = courses.filter((c) => (c.progress ?? 0) < 100);

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
