import CourseMobileSidebar from "@/app/(course)/courses/[courseId]/_components/CourseMobileSidebar";
import NavbarRoutes from "@/components/NavbarRoutes";
import { Chapter, Course, UserProgress } from "@prisma/client";

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}
const CourseNavbar = ({ course, progressCount }: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar progressCount={progressCount} course={course} />
      <NavbarRoutes />
    </div>
  );
};

export default CourseNavbar;
