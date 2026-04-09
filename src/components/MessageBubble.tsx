import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Message } from '@/types'
import { Bot, User, Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("px-4 py-8 w-full group", isUser ? "" : "bg-muted/30")}>
      <div className="max-w-3xl mx-auto flex gap-4 w-full">
        <Avatar className={cn("w-8 h-8 flex-shrink-0", isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground border")}>
          {isUser ? (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="w-5 h-5" />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-green-600 text-white">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex flex-col w-full gap-2 min-w-0">
          <div className="font-semibold select-none text-sm">
            {isUser ? 'You' : 'Assistant'}
          </div>
          <div className="text-base leading-7 whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-foreground ml-1 align-middle animate-pulse" />
            )}
          </div>
          
          {!isUser && !isStreaming && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
