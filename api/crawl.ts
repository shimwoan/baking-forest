import type { VercelRequest, VercelResponse } from "@vercel/node";

const SOMOIM_URL =
  "https://www.somoim.co.kr/824ddd9e-2416-11f0-a72c-0a4f2cbd4b631";

interface EventData {
  name: string;
  date: number;
  time: number;
  location: string;
  fee: string;
  capacity: number;
  enrolled: number;
}

function formatDate(dateNum: number): string {
  const s = String(dateNum);
  if (s.length !== 8) return s;
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
}

function formatTime(timeNum: number): string {
  const s = String(timeNum).padStart(4, "0");
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

function parsePriceNumber(fee: string): number {
  const nums = fee.replace(/[^0-9]/g, "");
  return nums ? parseInt(nums, 10) : 0;
}

/**
 * Unescape a JavaScript string literal (Level 1 → Level 2).
 * The HTML contains JS-escaped content like \" \\ \\n etc.
 * This function strips one level of escaping so JSON.parse can handle the rest.
 */
function unescapeJsString(s: string): string {
  let result = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) {
      // \X → X (strip one escape level)
      result += s[i + 1];
      i++;
    } else {
      result += s[i];
    }
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(SOMOIM_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "manual",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status >= 300 && response.status < 400) {
      return res.status(502).json({
        error: "소모임 페이지가 리다이렉트됨",
      });
    }

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "소모임 페이지 요청 실패" });
    }

    const html = await response.text();

    // Captcha detection
    if (html.includes("captcha") || html.includes("CAPTCHA")) {
      return res.status(503).json({ error: "소모임 페이지에서 봇 감지됨" });
    }

    // The data is inside self.__next_f.push([1, "..."]) as a JS-escaped string.
    // In the raw HTML, quotes appear as \" (literal backslash + quote).
    const marker = '\\"groupInfoData\\":';
    const groupInfoIdx = html.indexOf(marker);
    if (groupInfoIdx === -1) {
      return res
        .status(500)
        .json({ error: "groupInfoData를 찾을 수 없습니다" });
    }

    // Find the opening { after the marker
    const jsonStart = html.indexOf("{", groupInfoIdx + marker.length);
    if (jsonStart === -1) {
      return res
        .status(500)
        .json({ error: "groupInfoData JSON 시작을 찾을 수 없습니다" });
    }

    // Count braces to find the matching closing }.
    // In the raw HTML: \" is a string delimiter, \\\\ is an escaped backslash,
    // and { } outside strings are structural braces.
    let braceCount = 0;
    let jsonEnd = jsonStart;
    let inString = false;

    for (let i = jsonStart; i < html.length; i++) {
      const ch = html[i];

      if (ch === "\\") {
        const next = html[i + 1];
        if (next === "\\") {
          // Escaped backslash \\, skip both
          i++;
          continue;
        }
        if (next === '"') {
          // String delimiter \"
          inString = !inString;
          i++;
          continue;
        }
        // Other escape like \n, \t — skip both
        i++;
        continue;
      }

      if (inString) continue;
      if (ch === "{") braceCount++;
      if (ch === "}") {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }

    if (braceCount !== 0) {
      return res
        .status(500)
        .json({ error: "groupInfoData JSON 추출 실패: 중괄호 불일치" });
    }

    const rawJson = html.slice(jsonStart, jsonEnd);

    // Unescape one level of JS string escaping, then JSON.parse handles the rest
    const unescaped = unescapeJsString(rawJson);

    let data: any;
    try {
      data = JSON.parse(unescaped);
    } catch {
      return res
        .status(500)
        .json({ error: "groupInfoData JSON 파싱 실패" });
    }

    const group = data.group;
    const members: any[] = data.members || [];

    if (!group || typeof group !== "object") {
      return res.status(500).json({ error: "group 데이터를 찾을 수 없습니다" });
    }

    // Extract up to 4 events
    const events: EventData[] = [];
    const suffixes = ["", "2", "3", "4"];

    // Today's date as YYYYMMDD number for filtering past events
    const today = parseInt(
      new Date().toISOString().slice(0, 10).replace(/-/g, ""),
      10
    );

    for (const suffix of suffixes) {
      const name = group[`en${suffix}`];
      if (!name) continue;

      // Skip events where participation is disabled
      const ipe = group[`ipe${suffix}`] || "N";
      if (ipe !== "Y") continue;

      const dateVal = group[`e_d${suffix}`];

      // Skip past events
      if (typeof dateVal === "number" && dateVal < today) continue;
      const timeVal = group[`e_t${suffix}`];
      const location = group[`el${suffix}`] || "";
      const fee = group[`ee${suffix}`] || "";
      const capacity = group[`emm${suffix}`] || 0;

      // Count enrolled members: members whose ijo[suffix] === "Y"
      const ijoKey = `ijo${suffix}`;
      const enrolled = members.filter((m) => m[ijoKey] === "Y").length;

      events.push({
        name,
        date: dateVal,
        time: timeVal,
        location,
        fee,
        capacity,
        enrolled,
      });
    }

    // Map to BakingClass-compatible JSON
    const classes = events.map((event, idx) => {
      const dateStr = formatDate(event.date);
      const timeStr = formatTime(event.time);
      const isFull =
        event.capacity > 0 && event.enrolled >= event.capacity;

      return {
        id: `event-${idx + 1}`,
        name: event.name,
        title: event.name,
        datetime: `${dateStr} ${timeStr}`,
        date: `${dateStr}`,
        time: timeStr,
        description: "",
        image: "/images/placeholder.png",
        price: parsePriceNumber(event.fee),
        priceLabel: event.fee,
        instructor: group.an || "강사 미정",
        location: event.location,
        members: `${event.enrolled}/${event.capacity}`,
        capacity: event.capacity,
        enrolled: event.enrolled,
        level: "Beginner" as const,
        duration: "",
        items: [],
        isFull,
      };
    });

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json(classes);
  } catch (error) {
    console.error("크롤링 오류:", error);
    return res
      .status(500)
      .json({ error: "크롤링 중 오류 발생" });
  }
}
