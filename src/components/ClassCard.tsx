import { format } from "date-fns";
import { Calendar, Clock, Users } from "lucide-react";
import { BakingClass } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClassCardProps {
  bakingClass: BakingClass;
  onClick: () => void;
}

export function ClassCard({ bakingClass, onClick }: ClassCardProps) {
  // 날짜 포맷
  const formattedDate = format(new Date(bakingClass.date), "yyyy년 M월 d일");

  // 수강 가능 인원 계산
  const availableSpots = bakingClass.capacity - bakingClass.enrolled;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;
  const isFull = availableSpots === 0;

  // 난이도 한글 변환
  // const levelInKorean = {
  //   Beginner: "초급",
  //   Intermediate: "중급",
  //   Advanced: "고급",
  // }[bakingClass.level];

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={bakingClass.image}
          alt={bakingClass.title}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
        />
        {/* 초급 중급 밷지 */}
        {/* <div className="absolute top-3 right-3">
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
        </div> */}
      </div>

      <CardContent className="p-4">
        <h3 className="text-xl font-semibold tracking-tight">
          {bakingClass.title}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {bakingClass.time} • {bakingClass.duration}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {bakingClass.items.slice(0, 3).map((item, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {item}
            </Badge>
          ))}
          {bakingClass.items.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{bakingClass.items.length - 3}개 더보기
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4" />
          <span
            className={cn(
              isFull && "text-destructive",
              isAlmostFull && "text-amber-600"
            )}
          >
            {isFull ? "마감" : `${availableSpots}자리 남음`}
          </span>
        </div>
        <Button
          onClick={onClick}
          disabled={isFull}
          variant={isFull ? "outline" : "default"}
        >
          {isFull ? "마감" : "자세히 보기"}
        </Button>
      </CardFooter>
    </Card>
  );
}
