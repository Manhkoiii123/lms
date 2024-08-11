"use client";

import SidebarItem from "@/app/(dashboard)/_components/SidebarItem";
import { Compass, Layout } from "lucide-react";

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

const SidebarRoutes = () => {
  const routes = guestRoutes;
  return (
    <div className="flex flex-col w-full">
      {routes.map((r) => (
        <SidebarItem key={r.href} icon={r.icon} label={r.label} href={r.href} />
      ))}
    </div>
  );
};

export default SidebarRoutes;
