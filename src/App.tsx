import { useState, useEffect } from "react";
import { BakingClass } from "@/types";
import { BakingClassList } from "@/components/BakingClassList";
import { Toaster } from "@/components/ui/toaster";
import { getClasses } from "@/lib/supabase";
import { mockClasses } from "@/data/mockClasses";

function App() {
  const [classes, setClasses] = useState<BakingClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        // Supabase에서 데이터 가져오기 시도
        const fetchedClasses = await getClasses();

        // Supabase에서 클래스를 가져오면 사용하고
        // 그렇지 않으면 데모용 데이터 사용
        if (fetchedClasses.length > 0) {
          setClasses(fetchedClasses);
        } else {
          setClasses(mockClasses);
        }
      } catch (error) {
        console.error("클래스 불러오기 오류:", error);
        // 데모 데이터로 대체
        setClasses(mockClasses);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="backdrop-blur-sm">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex items-center justify-center my-3">
            <div className="flex flex-col items-center gap-1">
              <img
                src="/images/logo.png"
                alt="베이킹 포레스트"
                className="h-[80px] w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-5 mx-auto">
        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold tracking-tight">
            원데이 클래스 참여
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
            "베이킹 전문 강사와 함께 맛과 품질은 물론, 함께하는 소소한 대화
            속에서 웃음과 힐링을 나누고자 해요"
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <p className="text-muted-foreground">클래스 불러오는 중...</p>
            </div>
          </div>
        ) : classes.length > 0 ? (
          <BakingClassList classes={classes} />
        ) : (
          <div className="flex justify-center items-center py-16">
            <p className="text-muted-foreground">
              현재 예정된 클래스가 없습니다
            </p>
          </div>
        )}
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container px-4 sm:px-6 mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 베이킹 포레스트. All rights reserved.
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

export default App;
