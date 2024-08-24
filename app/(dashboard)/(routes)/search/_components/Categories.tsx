"use client";

import CategoryItem from "@/app/(dashboard)/(routes)/search/_components/CategoryItem";
import { Category } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
} from "react-icons/fc";
import { IconType } from "react-icons/lib";
interface CategoriesProps {
  items: Category[];
}

const iconMap: Record<Category["name"], IconType> = {
  Music: FcMusic,
  "Computer Science": FcMultipleDevices,
  Photography: FcOldTimeCamera,
  Filming: FcFilmReel,
  Fitness: FcSportsMode,
  Accounting: FcSalesPerformance,
  Engineering: FcEngineering,
};
const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((i) => (
        <CategoryItem
          key={i.id}
          label={i.name}
          icon={iconMap[i.name]}
          value={i.id}
        />
      ))}
    </div>
  );
};

export default Categories;
