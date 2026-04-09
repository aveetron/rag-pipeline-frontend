import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim())
      setValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative flex items-end w-full max-w-3xl mx-auto bg-background border rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-ring p-1">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Assistant..."
        disabled={disabled}
        className="min-h-[44px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 p-3 pb-3 pr-12 text-base scrollbar-hide flex-1"
        rows={1}
      />
      <Button
        type="button"
        size="icon"
        disabled={!value.trim() || disabled}
        onClick={handleSend}
        className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
      >
        <Send className="w-4 h-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  )
}
