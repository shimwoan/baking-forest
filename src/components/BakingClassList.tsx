import { useState } from "react";
import { BakingClass } from "@/types";
import { ClassCard } from "@/components/ClassCard";
import { ClassDetailsModal } from "@/components/ClassDetailsModal";
import { Button } from "./ui/button";
import { ClassCreateModal } from "./ClassCreateModal";

interface BakingClassListProps {
  classes: BakingClass[];
  onApply: (classId: string) => void;
}

export function BakingClassList({ classes, onApply }: BakingClassListProps) {
  const [selectedClass, setSelectedClass] = useState<BakingClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClassClick = (bakingClass: BakingClass) => {
    setSelectedClass(bakingClass);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Small delay to prevent visual glitches when closing
    setTimeout(() => setSelectedClass(null), 300);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateClassClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateCloseModal = () => {
    setIsCreateModalOpen(false);
  };
  console.log("classes", classes);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((bakingClass) => (
          <ClassCard
            key={bakingClass.id}
            bakingClass={bakingClass}
            onClick={() => handleClassClick(bakingClass)}
          />
        ))}
      </div>

      <div className="flex flex-col justify-center items-center gap-2 mt-12">
        <p className="font-medium">원하는 품목 & 날짜가 있으신가요?</p>
        <Button variant="outline" onClick={handleCreateClassClick}>
          일정 생성하기
        </Button>
      </div>

      <ClassDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bakingClass={selectedClass}
        onApply={onApply}
      />

      <ClassCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateCloseModal}
      />
    </div>
  );
}
