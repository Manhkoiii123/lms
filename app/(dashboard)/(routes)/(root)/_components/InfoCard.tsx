import { IconBadge } from "@/components/icon-badge";
import { LucideIcon } from "lucide-react";
interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  numberOfItem: number;
  variant?: "default" | "success";
}
const InfoCard = ({ icon, label, numberOfItem, variant }: InfoCardProps) => {
  return (
    <div className="border rounded-md flex items-center gap-x-2 p-3">
      <IconBadge icon={icon} variant={variant} />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-gray-500 text-sm">
          {numberOfItem} {numberOfItem === 1 ? "Course" : "Courses"}
        </p>
      </div>
    </div>
  );
};

export default InfoCard;
