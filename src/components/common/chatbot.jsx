import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, X, Bot } from 'lucide-react'

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          text: '안녕하세요! 여행 계획에 대해 궁금한 점이 있으신가요? 날씨에 맞는 여행지를 추천해 드릴게요.',
          sender: 'bot',
        },
      ])
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (input.trim() === '') return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Mock bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: '현재는 데모 버전입니다. 입력하신 내용에 대한 답변을 드릴 수 없습니다. 곧 실제 AI 챗봇으로 찾아뵙겠습니다!',
        sender: 'bot',
      }
      setMessages((prev) => [...prev, userMessage, botResponse])
    }, 1000)
  }

  return (
    <>
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-16 w-16 rounded-full shadow-lg"
          size="icon"
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <MessageSquare className="h-8 w-8" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed right-8 bottom-28 z-50 flex h-[30rem] w-80 flex-col rounded-lg bg-white shadow-xl">
          <header className="flex items-center justify-between rounded-t-lg bg-gray-900 p-4 text-white">
            <h3 className="font-bold">Weather Flick 챗봇</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <Bot className="mr-2 h-6 w-6 self-end text-blue-600" />
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="rounded-b-lg border-t bg-white p-4"
          >
            <div className="flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" size="icon" className="ml-2">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
