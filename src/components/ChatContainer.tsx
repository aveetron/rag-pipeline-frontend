import { useState, useRef, useEffect } from 'react'
import type { Message } from '@/types'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content }
    const assistantMessageId = crypto.randomUUID()
    
    // Optimistically add user and empty assistant message
    setMessages(prev => [
      ...prev, 
      userMessage, 
      { id: assistantMessageId, role: 'assistant', content: '' }
    ])
    
    setIsStreaming(true)
    setError(null)
    
    try {
      const response = await fetch('http://127.0.0.1:8000/query/ask/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: content,
          collection_name: '32e0894d-c466-449d-812f-f839589d5dbf',
          top_k: 1
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("No response body returned")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // In case the backend sends multiple JSON objects without newlines, 
        // we insert a newline between them.
        buffer = buffer.replace(/}\s*{/g, '}\n{')
        
        // Process line by line
        const lines = buffer.split('\n')
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.trim() === '') continue
          try {
            // Some APIs might send SSE format `data: {...}`. Let's strip `data: ` if it exists.
            const cleanLine = line.replace(/^data:\s*/, '').trim()
            if (!cleanLine) continue
            
            const parsed = JSON.parse(cleanLine)
            if (parsed.delta) {
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMessageId 
                    ? { ...m, content: m.content + parsed.delta } 
                    : m
                )
              )
            }
          } catch (e) {
            console.error('Failed to parse streaming JSON line:', line, e)
            // If it failed to parse, it might be an incomplete JSON across a weird boundary, 
            // though replacing }{ with }\n{ usually is safe.
          }
        }
      }

      // Handle any remaining content in buffer
      if (buffer.trim()) {
         try {
           const cleanLine = buffer.replace(/^data:\s*/, '').trim()
           const parsed = JSON.parse(cleanLine)
           if (parsed.delta) {
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMessageId 
                    ? { ...m, content: m.content + parsed.delta } 
                    : m
                )
              )
            }
         } catch(e) {
           console.error('Failed to parse final buffer:', buffer, e)
         }
      }

    } catch (err: any) {
      console.error("Streaming error:", err)
      setError(err?.message || 'Failed to connect to the assistant.')
      // Optionally pop the empty assistant message on error if it's still empty
      setMessages(prev => prev.filter(m => !(m.id === assistantMessageId && m.content === '')))
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <ScrollArea className="flex-1 h-full">
        <div className="flex flex-col pb-40 pt-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <h2 className="text-3xl font-semibold mb-3 tracking-tight">How can I help you today?</h2>
              <p className="text-muted-foreground md:text-lg max-w-md">Start typing to begin a conversation with the AI assistant.</p>
            </div>
          ) : (
            messages.map((m, index) => (
              <MessageBubble 
                key={m.id} 
                message={m} 
                isStreaming={isStreaming && index === messages.length - 1} 
              />
            ))
          )}
          {error && (
            <div className="text-destructive text-center p-4 mx-4 bg-destructive/10 rounded-lg mt-4 max-w-fit align-self-center self-center">
              {error}
            </div>
          )}
          <div ref={bottomRef} className="h-1" />
        </div>
      </ScrollArea>
      
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-16 pb-6 px-4">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
        <div className="text-center mt-3 text-xs text-muted-foreground">
          AI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  )
}
