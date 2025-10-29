import { MessageCircle } from "lucide-react";

interface KakaoFloatingButtonProps {
  channelId?: string;
}

export function KakaoFloatingButton({ channelId }: KakaoFloatingButtonProps) {
  const handleClick = () => {
    if (channelId) {
      // 카카오톡 채널 채팅 URL
      window.open(`http://pf.kakao.com/${channelId}/chat`, "_blank");
    } else {
      // 채널 ID가 없으면 알림
      alert("카카오톡 채널 정보가 설정되지 않았습니다.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#FEE500] text-[#3C1E1E] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="카카오톡 상담"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}
