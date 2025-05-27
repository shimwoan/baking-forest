import { useState } from "react";
import { BakingClass } from "@/types";
import { ClassCard } from "@/components/ClassCard";
import { ClassDetailsModal } from "@/components/ClassDetailsModal";

interface BakingClassListProps {
  classes: BakingClass[];
}

export function BakingClassList({ classes }: BakingClassListProps) {
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
      <ClassDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bakingClass={selectedClass}
      />
    </div>
  );
}
