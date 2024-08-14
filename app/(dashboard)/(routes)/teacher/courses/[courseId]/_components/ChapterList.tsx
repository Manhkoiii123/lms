"use client";

import { Chapter } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Grip, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
interface ChapterListProps {
  items: Chapter[];
  onReOrder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}
const ChapterList = ({ items, onEdit, onReOrder }: ChapterListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items);
  }, [items]);
  const onDragEnd = (res: DropResult) => {
    if (!res.destination) return;
    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(res.source.index, 1); //cắt phần tử di chuyển đi
    items.splice(res.destination.index, 0, reorderedItem); // di chuyển tới vị trí mới
    const startIndex = Math.min(res.source.index, res.destination.index);
    const endIndex = Math.max(res.source.index, res.destination.index);
    //đây là khoảng mà phần tử đầu là vị trí cũ, pt cuối là vị trí đích
    const updateChapters = items.slice(startIndex, endIndex + 1);
    //các phần tử còn lại
    setChapters(items);
    // convert lại của updateChapters
    const bulkUpdateData = updateChapters.map((c) => ({
      id: c.id,
      position: items.findIndex((i) => i.id === c.id),
    }));
    onReOrder(bulkUpdateData);
  };

  if (!isMounted) return null;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {chapters.map((c, i) => (
              <Draggable key={c.id} draggableId={c.id} index={i}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 mb-4 text-sm",
                      c.isPublished && "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        c.isPublished && "border-r-sky-200 hover:bg-sky-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {c.title}
                    <div className="ml-auto flex items-center gap-x-2 pr-2 ">
                      {c.isFree && <Badge>Free</Badge>}
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          c.isPublished && "bg-sky-700"
                        )}
                      >
                        {c.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(c.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ChapterList;
