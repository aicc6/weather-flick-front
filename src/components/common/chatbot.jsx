import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, X, Bot, Sparkles } from '@/components/icons'
import { cn } from '@/lib/utils'
import { initialBotMessage, CHATBOT_CONFIG } from '@/data'
import {
  useSendChatMessageMutation,
  useGetInitialMessageQuery,
} from '@/store/api/chatbotApi'
import { toast } from 'sonner'

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center space-x-1.5 p-2">
    <span className="bg-sky-blue h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></span>
    <span className="bg-sky-blue h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></span>
    <span className="bg-sky-blue h-2 w-2 animate-bounce rounded-full"></span>
  </div>
)

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Redux에서 사용자 정보 가져오기
  const user = useSelector((state) => state.auth?.user || null)

  // RTK Query hooks
  const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation()
  const { data: initialMessage } = useGetInitialMessageQuery(undefined, {
    skip: !isOpen, // API 호출을 열릴 때만 실행
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Set initial message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true)
      setTimeout(() => {
        const welcomeMessage = initialMessage || initialBotMessage

        // 백엔드에서 받은 개인화된 메시지 사용
        const messageText = welcomeMessage.message || welcomeMessage.text

        setMessages([
          {
            id: Date.now(),
            text: messageText,
            sender: 'bot',
            suggestions: welcomeMessage.suggestions || [],
          },
        ])
        setIsTyping(false)
      }, CHATBOT_CONFIG.welcomeDelay / 2)
    }
  }, [isOpen, messages.length, initialMessage, user])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === '' || isTyping || isSending) return

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // 실제 OpenAI API 호출
      const response = await sendMessage({
        text: input,
        context: {
          // 필요에 따라 컨텍스트 추가
          timestamp: new Date().toISOString(),
          use_personalized: true, // 개인화 기능 활성화
          user_info: user
            ? {
                nickname: user.nickname,
                preferred_region: user.preferred_region,
                preferred_theme: user.preferred_theme,
              }
            : null,
        },
      }).unwrap()

      setIsTyping(false)

      const botResponse = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        suggestions: response.suggestions || [],
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      setIsTyping(false)
      console.error('챗봇 응답 오류:', error)

      // 에러 시 fallback 메시지
      const errorMessage = {
        id: Date.now() + 1,
        text: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        sender: 'bot',
        suggestions: [
          '날씨 정보를 알려주세요',
          '여행지를 추천해주세요',
          '도움말을 보여주세요',
        ],
      }

      setMessages((prev) => [...prev, errorMessage])
      toast.error('챗봇 응답 중 오류가 발생했습니다.')
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'weather-glow h-16 w-16 transform rounded-full shadow-2xl transition-all duration-300 ease-in-out',
            isOpen
              ? 'sunset-button scale-110'
              : 'weather-button scale-100 hover:scale-110',
          )}
          size="icon"
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <MessageSquare className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Chat Window */}
      <div
        className={cn(
          'weather-card fixed right-8 bottom-28 z-50 flex h-[32rem] w-96 flex-col shadow-2xl transition-all duration-500 ease-in-out',
          'origin-bottom-right transform',
          isOpen
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        <header className="weather-button flex items-center space-x-3 rounded-t-2xl p-4 shadow-lg dark:text-white">
          <Sparkles className="text-sunshine-yellow sunshine-glow h-6 w-6" />
          <h3 className="text-lg font-bold">Weather Flick AI 챗봇</h3>
        </header>

        <div className="bg-cloud-white dark:bg-card flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div
                className={cn(
                  'animate-in fade-in slide-in-from-bottom-4 flex items-end gap-3 duration-500',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.sender === 'bot' && (
                  <div className="bg-sky-blue-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Bot className="h-5 w-5 dark:text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md transition-all hover:shadow-lg',
                    msg.sender === 'user'
                      ? 'weather-button rounded-br-none dark:text-white'
                      : 'glass-effect text-storm-gray-dark dark:text-foreground rounded-bl-none',
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>

              {/* 추천 질문 버튼들 */}
              {msg.sender === 'bot' &&
                msg.suggestions &&
                msg.suggestions.length > 0 && (
                  <div className="mt-2 ml-11 flex flex-wrap gap-2">
                    {msg.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-sky-blue-dark border-sky-blue hover:bg-sky-blue h-7 rounded-full px-3 text-xs transition-colors hover:text-white"
                        disabled={isTyping || isSending}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {(isTyping || isSending) && (
            <div className="flex items-end gap-3">
              <div className="bg-primary-blue-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="glass-effect text-storm-gray-dark dark:text-foreground rounded-2xl rounded-bl-none px-4 py-2.5 shadow-md">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="border-cloud-gray dark:border-border dark:bg-card rounded-b-2xl border-t bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="weather-input h-10 flex-1 rounded-full px-4"
              autoComplete="off"
              disabled={isTyping || isSending}
            />
            <Button
              type="submit"
              size="icon"
              className="sunny-button h-10 w-10 rounded-full"
              disabled={isTyping || isSending || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
