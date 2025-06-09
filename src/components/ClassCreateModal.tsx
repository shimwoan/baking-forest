import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreateForm } from "./CreateForm";

interface ClassCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClassCreateModal({ isOpen, onClose }: ClassCreateModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-[85vh] max-w-full sm:max-w-xl sm:rounded-t-xl overflow-auto"
      >
        <SheetHeader className="relative pb-0">
          <div className="flex items-center justify-between mb-2">
            <SheetTitle className="text-xl font-bold">일정 생성하기</SheetTitle>
          </div>
      </SheetHeader>

        <CreateForm onCancel={() => {}} onSuccess={onClose} />
      </SheetContent>
    </Sheet>
  );
}
