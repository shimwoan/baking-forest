import { Calendar, CircleDollarSign, MapPin, Users } from "lucide-react";
import { BakingClass } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ClassCardProps {
  bakingClass: BakingClass;
  onClick: () => void;
}

export function ClassCard({ bakingClass, onClick }: ClassCardProps) {
  // 날짜 포맷
  // 수강 가능 인원 계산
  const availableSpots = bakingClass.capacity - bakingClass.enrolled;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;
  const isFull = bakingClass.isFull;

  // 난이도 한글 변환
  // const levelInKorean = {
  //   Beginner: "초급",
  //   Intermediate: "중급",
  //   Advanced: "고급",
  // }[bakingClass.level];
  return (
    <Card className="flex overflow-hidden transition-all duration-300">
      <div className="flex-none relative w-[112px] h-40 overflow-hidden">
        <img
          src={bakingClass.image}
          alt={bakingClass.title}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105 rounded-xl"
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

      <CardContent className="flex flex-col w-full pl-3 pr-0 py-1">
        <h3 className="text-[17px] font-semibold tracking-tight">
          {bakingClass.name}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-sm text-gray-800">
          <Calendar className="flex-none w-4 h-4" />
          <span>{bakingClass.datetime}</span>
        </div>

        <div className="flex gap-2 mt-1.5 text-sm text-gray-800">
          <MapPin className="flex-none w-4 h-4 mt-1" />
          <span>청주시 흥덕구 봉명동 685-9</span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-800">
          <CircleDollarSign className="flex-none w-4 h-4" />
          <span>{bakingClass.price}</span>
        </div>

        <CardFooter className="flex items-center justify-between w-full p-0 pt-2 mt-auto">
          <div className="flex items-center gap-1 text-[15px]">
            <Users className="w-4 h-4" />
            <span
              className={cn(
                isFull && "text-destructive",
                isAlmostFull && "text-amber-600"
              )}
            >
              {isFull ? "마감" : `${bakingClass.members}`}
            </span>
          </div>
          <Button
            onClick={onClick}
            disabled={isFull}
            variant={isFull ? "outline" : "default"}
            size="sm"
          >
            {isFull ? "마감" : "신청 하기"}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
