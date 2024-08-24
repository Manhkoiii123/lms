import { columns } from "@/app/(dashboard)/(routes)/teacher/courses/_components/Column";
import { DataTable } from "@/app/(dashboard)/(routes)/teacher/courses/_components/data-table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  const courses = await db.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6 flex flex-col gap-4">
      {/* <Button>
        <Link href={"/teacher/create"}>New Course</Link>
      </Button> */}
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default page;
