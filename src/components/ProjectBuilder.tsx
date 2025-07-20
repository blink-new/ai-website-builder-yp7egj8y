import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable'
import { 
  ArrowLeft,
  Send,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  ExternalLink,
  Code,
  Eye,
  Sparkles,
  Globe,
  Settings
} from 'lucide-react'
import { blink } from '../blink/client'

interface ProjectBuilderProps {
  user: {
    id: string
    email: string
    displayName?: string
  }
  onBackToHome: () => void
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'
type ViewMode = 'preview' | 'code'

export default function ProjectBuilder({ user, onBackToHome }: ProjectBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. Describe the website you'd like to build and I'll help you create it step by step.",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [previewUrl, setPreviewUrl] = useState('about:blank')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsGenerating(true)
    setIsTyping(true)

    try {
      // Simulate AI response with streaming
      setTimeout(() => {
        const responses = [
          "I'll help you create that! Let me start by setting up the basic structure...",
          "Great idea! I'm generating the HTML and CSS for your website now...",
          "Perfect! I'm adding the interactive elements and making it responsive...",
          "Almost done! I'm optimizing the design and adding the finishing touches..."
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: randomResponse,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        setIsGenerating(false)
        
        // Simulate preview update
        setPreviewUrl(`data:text/html,<html><body style="font-family: Inter, sans-serif; padding: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-align: center;"><h1>🚀 Your Website is Being Built!</h1><p>This is a preview of your AI-generated website.</p><div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; backdrop-filter: blur(10px);"><h2>✨ Features Added:</h2><ul style="list-style: none; padding: 0;"><li>📱 Responsive Design</li><li>🎨 Modern Styling</li><li>⚡ Fast Loading</li><li>🔧 SEO Optimized</li></ul></div></body></html>`)
      }, 2000)

    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      setIsGenerating(false)
    }
  }

  const getDeviceClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-[375px] h-[667px]'
      case 'tablet':
        return 'w-[768px] h-[1024px]'
      default:
        return 'w-full h-full'
    }
  }

  const refreshPreview = () => {
    const iframe = document.querySelector('iframe')
    if (iframe) {
      const currentSrc = iframe.src
      iframe.src = 'about:blank'
      setTimeout(() => {
        iframe.src = currentSrc
      }, 100)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBackToHome}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 gradient-bg rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">AI Website Builder</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant={viewMode === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('code')}
            >
              <Code className="w-4 h-4 mr-2" />
              Code
            </Button>
          </div>

          {/* Device Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={deviceType === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceType === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceType === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" />
            Deploy
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat Sidebar */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full flex flex-col border-r">
              {/* Chat Header */}
              <div className="p-4 border-b">
                <h2 className="font-semibold flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  AI Assistant
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Describe what you want to build
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="typing-indicator"></div>
                        <div className="typing-indicator"></div>
                        <div className="typing-indicator"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    placeholder="Describe your website..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isGenerating}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isGenerating}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {isGenerating && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating your website...
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full flex flex-col">
              {/* Preview Header */}
              <div className="border-b p-3 flex items-center justify-between bg-muted/30">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-background border rounded px-3 py-1 text-sm text-muted-foreground">
                    https://your-website.com
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={refreshPreview}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-4 bg-muted/20 flex items-center justify-center">
                {viewMode === 'preview' ? (
                  <div className={`${getDeviceClasses()} border rounded-lg overflow-hidden shadow-lg bg-white`}>
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0"
                      title="Website Preview"
                    />
                  </div>
                ) : (
                  <Card className="w-full h-full p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Generated Code</h3>
                        <Badge variant="secondary">HTML/CSS/JS</Badge>
                      </div>
                      <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-auto h-full">
                        <div className="text-green-600">// Your AI-generated website code will appear here</div>
                        <div className="text-blue-600 mt-2">&lt;!DOCTYPE html&gt;</div>
                        <div className="text-blue-600">&lt;html lang="en"&gt;</div>
                        <div className="text-blue-600 ml-2">&lt;head&gt;</div>
                        <div className="text-blue-600 ml-4">&lt;meta charset="UTF-8"&gt;</div>
                        <div className="text-blue-600 ml-4">&lt;title&gt;Your AI Website&lt;/title&gt;</div>
                        <div className="text-blue-600 ml-2">&lt;/head&gt;</div>
                        <div className="text-blue-600 ml-2">&lt;body&gt;</div>
                        <div className="text-gray-600 ml-4">// Generated content...</div>
                        <div className="text-blue-600 ml-2">&lt;/body&gt;</div>
                        <div className="text-blue-600">&lt;/html&gt;</div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}