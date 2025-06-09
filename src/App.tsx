import { useState, useEffect, useRef } from "react";
import { BakingClass } from "@/types";
import { BakingClassList } from "@/components/BakingClassList";
import { Toaster } from "@/components/ui/toaster";
import { v4 as uuidv4 } from "uuid";
import useScrollSpy from "react-use-scrollspy";

// --------------------------import ScrollSpy from "react-ui-scrollspy";---
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
        // —————————————————————————————————————————————————————————————————]
        console.log("rawData", rawData);
        const data = Array.isArray(rawData) ? rawData : [rawData];

        const fetchedClasses: any = data?.map((item: Record<string, any>) => {
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

  const sectionRefs = [useRef(null), useRef(null), useRef(null)];
  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    offsetPx: -120,
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-10 py-4 bg-white backdrop-blur-sm">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex items-center justify-center">
            <div className="flex justify-end items-center gap-1 w-full">
              <div className="flex gap-6 font-medium">
                <span
                  className={
                    activeSection === 0
                      ? "font-semibold underline text-[#FF8855]"
                      : ""
                  }
                >
                  소개
                </span>
                <span
                  className={
                    activeSection === 1
                      ? "font-semibold underline text-[#FF8855]"
                      : ""
                  }
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
          <img src="/images/bg.png" alt="" />
        </div>
        <section ref={sectionRefs[0]}>
          <pre className="whitespace-break-spaces">
            {`
청주 베이킹 원데이 클래스 & 취미 공유 

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

        <section ref={sectionRefs[1]}>
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
          ) : classes.length > 0 ? (
            <BakingClassList classes={classes} />
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
    </div>
  );
}

export default App;
