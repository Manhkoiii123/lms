"use client";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import toast from "react-hot-toast";
interface FileUploadProps {
  onChange: (url: string) => void;
  endPoint: keyof typeof ourFileRouter;
}
export const FileUpload = ({ endPoint, onChange }: FileUploadProps) => {
  return (
    <UploadDropzone
      endpoint={endPoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(err: Error) => {
        toast.error(`${err?.message} `);
      }}
    />
  );
};
