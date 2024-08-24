import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const publishChapter = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });
    const publishChapterIds = publishChapter.map((c) => c.id);
    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId,
        chapterId: {
          in: publishChapterIds,
        },
        isCompleted: true,
      },
    });
    const progressPercentage =
      (validCompletedChapters / publishChapterIds.length) * 100;
    return progressPercentage;
  } catch (error) {
    console.log("🚀 ~ getProgress ~ error:", error);
    return 0;
  }
};
