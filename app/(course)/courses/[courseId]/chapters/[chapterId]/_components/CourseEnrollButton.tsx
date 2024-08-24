"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

const CourseEnrollButton = ({
  price,
  courseId,
}: {
  price: number;
  courseId: string;
}) => {
  return (
    <Button className="w-full md:w-auto">
      Enroll for {formatPrice(price)}
    </Button>
  );
};

export default CourseEnrollButton;
