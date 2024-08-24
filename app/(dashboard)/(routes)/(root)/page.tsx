import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import InfoCard from "@/app/(dashboard)/(routes)/(root)/_components/InfoCard";
import CoursesList from "@/components/CoursesList";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

const DashBoard = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  );
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItem={coursesInProgress.length}
        />
        <InfoCard
          icon={CheckCircle}
          variant="success"
          label="Completed"
          numberOfItem={completedCourses.length}
        />
      </div>
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
};

export default DashBoard;
