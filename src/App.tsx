import { useState, useEffect } from "react";
import { BakingClass } from "@/types";
import { BakingClassList } from "@/components/BakingClassList";
import { Toaster } from "@/components/ui/toaster";
import { v4 as uuidv4 } from "uuid";

// -----------------------------
// Zyte 프로젝트 정보 (실제 값으로 바꿔주세요)
// -----------------------------
const PROJECT_ID = "814119"; // Zyte 대시보드 → 프로젝트 ID
const API_KEY = "7e55289cdb1740cf988234aefef679c3"; // Zyte 대시보드 → API Key
// -----------------------------

// 1) Jobs List API: 최신 완료된 Job 1건만 가져오기 (apikey 파라미터 제거)
const JOBS_LIST_API_URL = `https://app.zyte.com/api/jobs/list.json?project=${PROJECT_ID}&state=finished&count=1&apikey=${API_KEY}`;

// 2) Storage API URL 생성: output_format=json만 붙이고, 인증은 헤더로 처리
function makeItemsUrl(jobId: string) {
  return `https://storage.scrapinghub.com/items/${jobId}?output_format=json&apikey=${API_KEY}`;
}

function App() {
  const [classes, setClasses] = useState<BakingClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClassesFromExternalAPI() {
      try {
        setIsLoading(true);

        // —————————————————————————————————————————————————————————————————
        // 1) Jobs List API 호출 (Basic Auth)
        // —————————————————————————————————————————————————————————————————
        const jobsResp = await fetch(JOBS_LIST_API_URL, {
          headers: {
            // Zyte Basic Auth: Username = API_KEY, Password = 빈 문자열
            Authorization: "Basic " + btoa(API_KEY + ":"),
          },
        });
        if (!jobsResp.ok) {
          throw new Error(`Jobs API 호출 실패: ${jobsResp.status}`);
        }

        const jobsJson = await jobsResp.json();
        const jobsArray = jobsJson?.jobs;
        if (!Array.isArray(jobsArray) || jobsArray.length === 0) {
          console.warn("해당 스케줄로 완료된 Job을 찾을 수 없습니다.");
          setClasses([]);
          return;
        }

        const latestJob = jobsArray[0] as {
          id: string;
          spider: string;
          [k: string]: any;
        };
        const jobId = latestJob.id;

        // —————————————————————————————————————————————————————————————————
        // 2) Storage API 호출: output_format=json으로 JSON 배열 받기 (Basic Auth)
        // —————————————————————————————————————————————————————————————————
        const itemsUrl = makeItemsUrl(jobId);
        const itemsResp = await fetch(itemsUrl, {
          headers: {
            Authorization: "Basic " + btoa(API_KEY + ":"),
          },
        });
        if (!itemsResp.ok) {
          throw new Error(`Items API 호출 실패: ${itemsResp.status}`);
        }

        // 여기서 JSON 파싱 직전에, 혹시 문자열에 문제가 있는지 확인해 봅니다.
        const rawText = await itemsResp.text();

        let rawData: any[];
        try {
          // output_format=json 이 제대로 작동해서 “[ { … }, { … } ]” 형태라면
          rawData = JSON.parse(rawText);
        } catch (e) {
          // 만약 JSON 파싱이 실패하면(줄 단위 JSON 혹은 에러 텍스트일 수 있음),
          // console에 원본을 찍어 보고, JSON Lines(줄 단위 JSON) 방식으로 파싱 시도
          console.warn("JSON 파싱 실패, rawText:", rawText);

          // 예시: JSON Lines → 각 줄마다 JSON.parse
          rawData = rawText
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => JSON.parse(line));
        }

        // —————————————————————————————————————————————————————————————————
        // 3) rawData(JSON 배열) → BakingClass 배열로 매핑
        // —————————————————————————————————————————————————————————————————
        const fetchedClasses: any = rawData.map((item: Record<string, any>) => {
          const membersRaw = item.members || "";
          const parts = membersRaw.split(/\/+/);
          const num1 = parts[0] || "";
          const num2 = parts[1] || "";
          const isFull = num1 === num2 && num1 !== "";

          return {
            id: uuidv4(),
            name: item.name || item.title || "제목 없음",
            datetime: item.datetime || item._ts || "",
            description: item.description || "설명 없음",
            image: item.image_url || "/images/placeholder.png",
            price: item.price || 0,
            instructor: item.instructor_name || "강사 미정",
            members: membersRaw.replace(/\/+/g, "/"),
            date: item.class_date || new Date().toISOString(),
            isFull,
            // … BakingClass 타입에 필요한 추가 필드가 있다면 여기서 매핑
          };
        });

        setClasses(fetchedClasses);
      } catch (error) {
        console.error("외부 API에서 클래스 불러오기 오류:", error);
        setClasses([]); // 에러 시 빈 배열로 처리
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
            “베이킹 전문 강사와 함께 맛과 품질은 물론, 함께하는 소소한 대화
            속에서 웃음과 힐링을 나누고자 해요”
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
