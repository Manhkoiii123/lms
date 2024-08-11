"use client";

import SidebarItem from "@/app/(dashboard)/_components/SidebarItem";
import { BarChart, Compass, Layout, List } from "lucide-react";
import { usePathname } from "next/navigation";

const guestRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Compass,
    label: "Browse",
    href: "/search",
  },
];
const teacherRoutes = [
  {
    icon: List,
    label: "Courses",
    href: "/teacher/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
];
const SidebarRoutes = () => {
  const pathname = usePathname();
  const isTeacherPage = pathname?.includes("/teacher");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((r) => (
        <SidebarItem key={r.href} icon={r.icon} label={r.label} href={r.href} />
      ))}
    </div>
  );
};

export default SidebarRoutes;
