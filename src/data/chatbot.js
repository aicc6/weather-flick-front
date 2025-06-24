// 챗봇 메시지 데이터
export const initialBotMessage = {
  id: Date.now(),
  text: '안녕하세요! 여행 계획에 대해 궁금한 점이 있으신가요? 날씨에 맞는 여행지를 추천해 드릴게요. ✈️',
  sender: 'bot',
}

export const mockBotResponse = {
  text: '현재는 데모 버전입니다. 입력하신 내용에 대한 답변을 드릴 수 없습니다. 곧 실제 AI 챗봇으로 찾아뵙겠습니다! ✨',
  sender: 'bot',
}

// 챗봇 상수
export const CHATBOT_CONFIG = {
  typingDelay: 1000, // 1초
  welcomeDelay: 2000, // 2초
}
