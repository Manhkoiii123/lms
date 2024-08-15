import Actions from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/Actions";
import AttachmentForm from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/AttachmentForm";
import CategoryForm from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/CategoryForm";
import ChaptersForm from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/ChaptersForm";
import DescriptionForm from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/DescriptionForm";
import ImageForm from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/ImageForm";
import PriceForm from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/PriceForm";
import TitleForm from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/TitleForm";
import Banner from "@/components/Banner";
import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListCheck,
} from "lucide-react";
import { redirect } from "next/navigation";
const page = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      userId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
      attachments: {
        orderBy: {
          name: "desc",
        },
      },
    },
  });

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  if (!course) {
    return redirect("/");
  }
  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((c) => c.isPublished),
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const isComplete = requiredFields.every(Boolean);

  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <>
      {!course.isPublished && (
        <Banner
          variant={"warning"}
          label="This course is unpublished.It will not be visible to the students"
        />
      )}
      <div className="p-6 ">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course Setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            isPublished={course.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-lg font-medium">Customize your course</h2>
            </div>
            <TitleForm initialData={course} courseId={params.courseId} />
            <DescriptionForm initialData={course} courseId={params.courseId} />
            <ImageForm initialData={course} courseId={params.courseId} />
            <CategoryForm
              initialData={course}
              courseId={params.courseId}
              options={categories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListCheck} />
                <h2 className="text-lg font-medium">Course Chapter</h2>
              </div>
              <ChaptersForm initialData={course} courseId={params.courseId} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-lg font-medium">Sell your course</h2>
              </div>
              <PriceForm initialData={course} courseId={params.courseId} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <IconBadge icon={File} />
                <h2 className="text-lg font-medium">Resources & Attachment</h2>
              </div>
              <AttachmentForm initialData={course} courseId={params.courseId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
