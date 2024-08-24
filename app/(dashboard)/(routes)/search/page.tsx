import { getCourses } from "@/actions/get-courses";
import Categories from "@/app/(dashboard)/(routes)/search/_components/Categories";
import CoursesList from "@/components/CoursesList";
import SearchInput from "@/components/SearchInput";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
interface SeachPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}
const SeachPage = async ({ searchParams }: SeachPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const courses = await getCourses({ userId, ...searchParams });
  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SeachPage;
