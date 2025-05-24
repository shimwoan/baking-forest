import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, ChefHat } from "lucide-react";
import { BakingClass } from "@/types";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RegistrationForm } from "@/components/RegistrationForm";
import { useState } from "react";

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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  if (!bakingClass) return null;

  // 날짜 포맷
  const formattedDate = format(
    new Date(bakingClass.date),
    "yyyy년 M월 d일 EEEE"
  );

  // 수강 가능 인원 계산
  const availableSpots = bakingClass.capacity - bakingClass.enrolled;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;
  const isFull = availableSpots === 0;

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
          <SheetDescription className="text-base">
            {bakingClass.description}
          </SheetDescription>
        </SheetHeader>

        {!showRegistrationForm ? (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">날짜</p>
                  <p className="text-sm text-muted-foreground">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">시간</p>
                  <p className="text-sm text-muted-foreground">
                    {bakingClass.time} • {bakingClass.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">강사</p>
                  <p className="text-sm text-muted-foreground">
                    {bakingClass.instructor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">장소</p>
                  <p className="text-sm text-muted-foreground">
                    {bakingClass.location}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">수업 내용</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bakingClass.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isFull && "text-destructive",
                      isAlmostFull && "text-amber-600"
                    )}
                  >
                    {isFull
                      ? "클래스가 마감되었습니다"
                      : `${availableSpots}자리 남았습니다`}
                  </span>
                </div>
                <p className="text-xl font-bold">
                  {bakingClass.price.toLocaleString()}원
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => setShowRegistrationForm(true)}
                disabled={isFull}
              >
                {isFull ? "마감" : "신청하기"}
              </Button>
            </div>
          </div>
        ) : (
          <RegistrationForm
            classId={bakingClass.id}
            onCancel={() => setShowRegistrationForm(false)}
            onSuccess={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
