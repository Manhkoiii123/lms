"use client";
import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import toast from "react-hot-toast";
interface FileUploadProps {
  onUpload: (url: string) => void;
  endPoint: keyof typeof ourFileRouter;
}
export const FileUpload = ({ endPoint, onUpload }: FileUploadProps) => {
  return (
    <UploadDropzone
      endpoint={endPoint}
      onClientUploadComplete={(res) => {
        onUpload(res[0].url);
      }}
      onUploadError={(err:Error)=>{
        toast.error(`${err.message} `)
      }}
    />
  );
};
