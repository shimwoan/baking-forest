import { useState, useEffect, useRef } from "react";
import { BakingClass } from "@/types";
import { BakingClassList } from "@/components/BakingClassList";
import { Toaster } from "@/components/ui/toaster";
import { v4 as uuidv4 } from "uuid";
import useScrollSpy from "react-use-scrollspy";
import { cn } from "./lib/utils";
import { KakaoFloatingButton } from "@/components/KakaoFloatingButton";

function getAppliedClasses(): string[] {
  try {
    return JSON.parse(localStorage.getItem("appliedClasses") || "[]");
  } catch {
    return [];
  }
}

function App() {
  const [classes, setClasses] = useState<BakingClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleApply = (classId: string) => {
    setClasses((prevClasses) =>
      prevClasses.map((cls) => {
        if (cls.id === classId && !cls.isFull && !cls.isApplied) {
          const parts = cls.members.split("/");
          const currentMembers = parseInt(parts[0] || "0", 10);
          const capacity = parseInt(parts[1] || "0", 10);

          const newMembers = Math.min(currentMembers + 1, capacity);
          const newMembersString = `${newMembers}/${capacity}`;
          const isFull = newMembers >= capacity;

          const classKey = `${cls.name}_${cls.datetime}`;
          const appliedClasses = getAppliedClasses();
          if (!appliedClasses.includes(classKey)) {
            appliedClasses.push(classKey);
            localStorage.setItem(
              "appliedClasses",
              JSON.stringify(appliedClasses)
            );
          }

          return {
            ...cls,
            members: newMembersString,
            isFull,
            isApplied: true,
          };
        }
        return cls;
      })
    );
  };

  useEffect(() => {
    async function fetchClasses() {
      try {
        setIsLoading(true);
        setError(null);

        const resp = await fetch("/api/crawl");
        if (!resp.ok) {
          throw new Error("API error: " + resp.status);
        }

        const data = await resp.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response format");
        }

        const appliedClasses = getAppliedClasses();

        const fetchedClasses: BakingClass[] = data.map((item) => {
          const name = item.name || "제목 없음";
          const datetime = item.datetime || "";
          const classKey = `${name}_${datetime}`;
          const isApplied = appliedClasses.includes(classKey);

          const parts = (item.members || "0/0").split("/");
          const currentMembers = parseInt(parts[0] || "0", 10);
          const capacity = parseInt(parts[1] || "0", 10);

          const displayEnrolled = isApplied
            ? Math.min(currentMembers + 1, capacity)
            : currentMembers;
          const displayMembers = `${displayEnrolled}/${capacity}`;
          const isFull = capacity > 0 && displayEnrolled >= capacity;

          return {
            id: uuidv4(),
            name,
            title: item.title || name,
            datetime,
            date: item.date || "",
            time: item.time || "",
            duration: item.duration || "",
            description: item.description || "",
            image: item.image || "/images/placeholder.png",
            price: item.price || 0,
            priceLabel: item.priceLabel || "",
            instructor: item.instructor || "강사 미정",
            location: item.location || "",
            members: displayMembers,
            capacity,
            enrolled: displayEnrolled,
            level: item.level || "Beginner",
            items: item.items || [],
            isFull,
            isApplied,
          };
        });

        setClasses(fetchedClasses);
      } catch (err) {
        console.error("클래스 불러오기 오류:", err);
        setError("클래스를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, []);

  const sectionRefs = [useRef(null), useRef(null)];
  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    offsetPx: -250,
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-10 py-4 bg-white backdrop-blur-sm">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex items-center justify-center">
            <div className="flex justify-end items-center gap-1 w-full">
              <div className="flex gap-6 font-medium">
                <span
                  onClick={() =>
                    (sectionRefs[0].current as any)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className={cn(
                    "cursor-pointer",
                    activeSection === 0
                      ? "font-semibold underline text-[#FF8855]"
                      : ""
                  )}
                >
                  소개
                </span>
                <span
                  onClick={() =>
                    (sectionRefs[1].current as any)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className={cn(
                    "cursor-pointer",
                    activeSection === 1
                      ? "font-semibold underline text-[#FF8855]"
                      : ""
                  )}
                >
                  참여하기
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 sm:px-6 pb-5 mx-auto">
        <div className="w-full h-auto tablet-x:h-[195px] overflow-hidden rounded-xl">
          <img src="/images/bg.png" className="w-full" alt="" />
        </div>
        <section ref={sectionRefs[0]} className="pt-8">
          <pre className="whitespace-break-spaces">
            {`청주 베이킹 원데이 클래스 & 취미 공유

"베이킹 전문 강사를 초청해 맛과 품질은 물론, 함께하는 소소한 대화 속에서 웃음과 힐링을 나누고자 해요"

❤️이런분께 추천해요❤️
🥨소소하게 베이킹하며,대화로 힐링타임을 즐기고 싶으신 분!
🥨손수 직접 만들어 소중한 분들께 선물하고 싶으신 분!
🥨베이킹이 처음이라 한 번 도전해보고 싶으신 분!

💛모임 운영 장소💛
🥨대상 : 누구나
🥨장소 : 청주 봉명동 오프라인 모임
🥨정원 : 3~6인(최소 3명 이상 진행)
                         -소수정예-

‼⭐️클래스 신청(원하는 품목 및 날짜 선택) 가능합니다. 자세한 사항은 공지사항을 참고해주세요😊

📌 주의사항
레시피와 자료는 개인 학습용으로만 사용 가능하며, 무단 복제, 공유, 상업적 이용, 타 클래스 사용은 금지됩니다.
          `}
          </pre>
        </section>

        <section ref={sectionRefs[1]} className="pt-8">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold tracking-tight">
              원데이 클래스 참여
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <p className="text-muted-foreground">클래스 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-16">
              <p className="text-destructive">{error}</p>
            </div>
          ) : classes.length > 0 ? (
            <BakingClassList classes={classes} onApply={handleApply} />
          ) : (
            <div className="flex justify-center items-center py-16">
              <p className="text-muted-foreground">
                현재 예정된 클래스가 없습니다
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container px-4 sm:px-6 mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            <a href="tel:0507-1344-1418" className="!text-gray-600">
              전화번호: 0507-1344-1418
            </a>
          </p>
        </div>
      </footer>

      <Toaster />
      <KakaoFloatingButton />
    </div>
  );
}

export default App;
