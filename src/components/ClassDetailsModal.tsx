import { BakingClass } from "@/types";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { RegistrationForm } from "@/components/RegistrationForm";

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bakingClass: BakingClass | null;
}

export function ClassDetailsModal({
  isOpen,
  onClose,
  bakingClass,
}: ClassDetailsModalProps) {
  if (!bakingClass) return null;

  // 난이도 한글 변환
  const levelInKorean = {
    Beginner: "초급",
    Intermediate: "중급",
    Advanced: "고급",
  }[bakingClass.level];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-[85vh] max-w-full sm:max-w-xl sm:rounded-t-xl overflow-auto"
      >
        <SheetHeader className="relative pb-0">
          <div className="h-48 sm:h-64 -mx-6 -mt-6 mb-6 overflow-hidden">
            <img
              src={bakingClass.image}
              alt={bakingClass.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <SheetTitle className="text-2xl font-bold">
              {bakingClass.title}
            </SheetTitle>
            <Badge
              variant="secondary"
              className={cn(
                "font-medium whitespace-nowrap",
                bakingClass.level === "Beginner" &&
                  "bg-emerald-100 text-emerald-800",
                bakingClass.level === "Intermediate" &&
                  "bg-amber-100 text-amber-800",
                bakingClass.level === "Advanced" && "bg-rose-100 text-rose-800"
              )}
            >
              {levelInKorean}
            </Badge>
          </div>
          <p className="font-medium text-xl">{bakingClass.name}</p>
        </SheetHeader>

        <RegistrationForm
          bakingClass={bakingClass}
          classId={"4a39d1be-3cf4-4a13-b3d4-8a64ce3f9272"}
          onCancel={() => {}}
          onSuccess={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}
