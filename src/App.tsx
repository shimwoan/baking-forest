/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { BakingClass } from "@/types"; // BakingClass 타입 정의를 확인하세요.
import { BakingClassList } from "@/components/BakingClassList";
import { Toaster } from "@/components/ui/toaster";
// getClasses는 더 이상 사용하지 않으므로 주석 처리하거나 삭제할 수 있습니다.
// import { getClasses } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
// 새 API URL
const EXTERNAL_API_URL =
  "https://storage.scrapinghub.com/items/814119/1/7?count=10&meta=_key&meta=_ts&apikey=7e55289cdb1740cf988234aefef679c3&format=json";

function App() {
  const [classes, setClasses] = useState<BakingClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClassesFromExternalAPI() {
      try {
        setIsLoading(true); // 로딩 시작
        const response = await fetch(EXTERNAL_API_URL);
        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status}`);
        }
        const rawData = await response.json(); // API로부터 원본 데이터 받기

        // --- 중요: API 데이터 매핑 시작 ---
        // API 응답이 배열 형태라고 가정합니다.
        // 실제 API 데이터 구조와 BakingClass 타입에 맞춰 이 부분을 수정해야 합니다.
        // 예시: rawData의 각 아이템을 BakingClass 형태로 변환
        const fetchedClasses: BakingClass[] = rawData.map(
          (item: Record<string, any>) => {
            // BakingClass 타입의 필수 필드를 API 응답의 해당 필드로 매핑합니다.
            // 아래는 예시이며, 실제 필드명으로 변경해야 합니다.
            // 예를 들어, API 응답에 title, description, image_url, price_value, instructor_name, unique_id, class_date 등이 있다면:

            // 슬래시(/) 여러 개를 기준으로 분리
            const parts = item.members.split(/\/+/);

            const num1 = parts[0];
            const num2 = parts[1];

            const isFull = num1 === num2;

            return {
              id: uuidv4(), // 고유 ID (API에 _key가 있다면 사용)
              name: item.name || item.title || "제목 없음", // 클래스 이름
              datetime: item.datetime,
              description: item.description || "설명 없음", // 설명
              image: item.image_url || "/images/placeholder.png", // 이미지 URL (없으면 기본 이미지)
              price: item.price || 0, // 가격
              instructor: item.instructor_name || "강사 미정", // 강사
              members: item.members?.replace(/\/+/g, "/"),
              date: item.class_date || new Date().toISOString(), // 날짜 (API에 날짜 정보가 없다면 현재 날짜)
              isFull,
              // ... BakingClass 타입에 필요한 다른 필드들
            };
          }
        );
        // --- API 데이터 매핑 끝 ---

        if (fetchedClasses.length > 0) {
          setClasses(fetchedClasses);
        } else {
          // API에서 데이터를 가져왔지만 비어있는 경우, mockClasses를 사용하거나 메시지를 표시할 수 있습니다.
          // 여기서는 mockClasses를 사용하도록 두겠습니다. 필요에 따라 변경하세요.
          console.warn(
            "API에서 클래스 정보를 가져왔으나 비어있습니다. 목업 데이터를 사용합니다."
          );
        }
      } catch (error) {
        console.error("외부 API에서 클래스 불러오기 오류:", error);
        // 에러 발생 시 데모 데이터로 대체
      } finally {
        setIsLoading(false);
      }
    }

    fetchClassesFromExternalAPI();
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
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
