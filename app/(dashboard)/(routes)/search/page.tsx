import Categories from "@/app/(dashboard)/(routes)/search/_components/Categories";
import SearchInput from "@/components/SearchInput";
import { db } from "@/lib/db";

const SeachPage = async () => {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6">
        <Categories items={categories} />
      </div>
    </>
  );
};

export default SeachPage;
