import { ChatContainer } from '@/components/ChatContainer'
import { Bot } from 'lucide-react'

function App() {
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans antialiased dark">
      <header className="h-14 flex items-center justify-between px-4 lg:px-8 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 sticky top-0">
        <h1 className="font-semibold text-base flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Avee Brain
        </h1>
      </header>
      <main className="flex-1 relative overflow-hidden">
         <ChatContainer />
      </main>
    </div>
  )
}

export default App
