import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

type PurchaseWithCourse = Purchase & {
  course: Course;
};
// tính tiền theo khóa học lọc theo tên
const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};

  purchases.forEach((p) => {
    const courseTitle = p.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += p.course.price!;
  });
  return grouped;
};
export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId: userId,
        },
      },
      include: {
        course: true,
      },
    });
    console.log("🚀 ~ getAnalytics ~ purchases:", purchases);
    const groupEarning = groupByCourse(purchases);
    console.log("🚀 ~ getAnalytics ~ groupEarning:", groupEarning);
    const data = Object.entries(groupEarning).map(([courseTitle, total]) => ({
      name: courseTitle,
      total,
    }));

    const totalRevenue = data.reduce((acc, cur) => acc + cur.total, 0);
    const totalSales = purchases.length;
    return { data, totalRevenue, totalSales };
  } catch (error) {
    console.log("🚀 ~ getAnalytics ~ error:", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
