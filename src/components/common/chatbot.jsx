import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, X, Bot, Sparkles } from '@/components/icons'
import { cn } from '@/lib/utils'
import { initialBotMessage, mockBotResponse, CHATBOT_CONFIG } from '@/data'

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center space-x-1.5 p-2">
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
  </div>
)

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Set initial message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true)
      setTimeout(() => {
        setMessages([
          {
            ...initialBotMessage,
            id: Date.now(),
          },
        ])
        setIsTyping(false)
      }, CHATBOT_CONFIG.welcomeDelay / 2)
    }
  }, [isOpen, messages.length])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (input.trim() === '' || isTyping) return

    const userMessage = {
      id: Date.now(), // Use timestamp for unique key
      text: input,
      sender: 'user',
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true) // Bot starts "typing"

    // Mock bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        ...mockBotResponse,
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false) // Bot stops "typing"
    }, CHATBOT_CONFIG.typingDelay)
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-16 w-16 transform rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl transition-all duration-300 ease-in-out hover:scale-110',
            isOpen && 'scale-110 bg-gradient-to-br from-gray-700 to-gray-900',
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
          'fixed right-8 bottom-28 z-50 flex h-[32rem] w-96 flex-col rounded-2xl bg-white shadow-2xl transition-all duration-500 ease-in-out',
          'origin-bottom-right transform',
          isOpen
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        <header className="flex items-center space-x-3 rounded-t-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-4 text-white shadow-lg">
          <Sparkles className="h-6 w-6 text-yellow-300" />
          <h3 className="text-lg font-bold">Weather Flick AI 챗봇</h3>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-100 p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-4 flex items-end gap-3 duration-500',
                msg.sender === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {msg.sender === 'bot' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md',
                  msg.sender === 'user'
                    ? 'rounded-br-none bg-blue-600 text-white'
                    : 'rounded-bl-none bg-white text-gray-800',
                )}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-none bg-white px-4 py-2.5 text-gray-800 shadow-md">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="rounded-b-2xl border-t bg-white p-4"
        >
          <div className="flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="h-10 flex-1 rounded-full px-4"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="ml-2 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
