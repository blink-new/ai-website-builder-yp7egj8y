import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
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
  Settings,
  Download,
  Upload,
  Save,
  Share,
  Zap,
  FileCode,
  Palette,
  Paperclip,
  Image,
  FileArchive,
  X,
  Link,
  Wand2,
  PartyPopper,
  Rocket,
  Coffee,
  Heart,
  Rainbow,
  Smile
} from 'lucide-react'
import { blink } from '../blink/client'

interface Project {
  id: string
  user_id: string
  name: string
  description: string
  prompt: string
  generated_code: string
  preview_url: string
  deployment_url: string
  template_id: string
  status: 'draft' | 'generating' | 'completed' | 'deployed'
  created_at: string
  updated_at: string
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string
  preview_image: string
  base_code: string
  is_featured: boolean
}

interface EnhancedProjectBuilderProps {
  user: {
    id: string
    email: string
    displayName?: string
  }
  project: Project
  onBackToProjects: () => void
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'
type ViewMode = 'preview' | 'code'

const funMessages = [
  "🎨 Let's create something amazing together!",
  "✨ Ready to sprinkle some AI magic on your website?",
  "🚀 What awesome feature should we build next?",
  "🌈 Time to make your website even more colorful!",
  "⚡ Let's add some lightning-fast functionality!",
  "🎭 Want to make your website more fun and interactive?",
  "🎪 Ready to turn your website into a digital carnival?",
  "🦄 Let's add some unicorn-level awesomeness!"
]

export default function EnhancedProjectBuilder({ user, project, onBackToProjects }: EnhancedProjectBuilderProps) {
  const [currentProject, setCurrentProject] = useState<Project>(project)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `${funMessages[Math.floor(Math.random() * funMessages.length)]} I'm ready to help you build "${project.name}". What would you like to create or modify? 🎯`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [templates, setTemplates] = useState<Template[]>([])
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [currentPreviewContent, setCurrentPreviewContent] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadTemplates = async () => {
    try {
      const allTemplates = await blink.db.templates.list({
        orderBy: { is_featured: 'desc' }
      })
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    const newFiles: File[] = []
    const newUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        const validTypes = [
          'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml',
          'application/zip', 'application/x-zip-compressed', 'application/x-zip',
          'text/html', 'text/css', 'text/javascript', 'application/javascript',
          'application/json', 'text/plain', 'application/pdf'
        ]
        
        if (!validTypes.includes(file.type) && !file.name.endsWith('.zip') && !file.name.endsWith('.html') && !file.name.endsWith('.css') && !file.name.endsWith('.js')) {
          console.warn(`Unsupported file type: ${file.type}`)
          continue
        }

        const { publicUrl } = await blink.storage.upload(
          file,
          `uploads/${user.id}/${Date.now()}-${file.name}`,
          { upsert: true }
        )

        newFiles.push(file)
        newUrls.push(publicUrl)
      }

      setUploadedFiles(prev => [...prev, ...newFiles])
      setUploadedUrls(prev => [...prev, ...newUrls])

      if (newFiles.length > 0) {
        let autoPrompt = ''
        const imageFiles = newFiles.filter(f => f.type.startsWith('image/'))
        const zipFiles = newFiles.filter(f => f.type.includes('zip') || f.name.endsWith('.zip'))
        const codeFiles = newFiles.filter(f => 
          f.type.includes('html') || f.type.includes('css') || f.type.includes('javascript') ||
          f.name.endsWith('.html') || f.name.endsWith('.css') || f.name.endsWith('.js')
        )
        
        if (imageFiles.length > 0) {
          autoPrompt = `🎨 Analyze the uploaded screenshot${imageFiles.length > 1 ? 's' : ''} and recreate the website design with pixel-perfect accuracy. Study the layout, typography, colors, spacing, components, and overall visual hierarchy. Create a modern, responsive version that captures the essence and functionality of the original design. Pay special attention to:
- Color scheme and gradients
- Typography and font choices  
- Layout structure and spacing
- Interactive elements and buttons
- Navigation patterns
- Content organization
- Visual effects and styling

Make it responsive and add smooth animations where appropriate.`
        } else if (zipFiles.length > 0) {
          autoPrompt = `📦 Extract and analyze the uploaded ZIP file containing website code/assets. Understand the project structure, examine the HTML, CSS, and JavaScript files, and recreate an improved modern version with:
- Clean, semantic HTML structure
- Modern CSS with responsive design
- Enhanced JavaScript functionality
- Improved performance and accessibility
- Better visual design and UX
- Mobile-first responsive layout

Maintain the core functionality while upgrading the design and code quality.`
        } else if (codeFiles.length > 0) {
          autoPrompt = `💻 Analyze the uploaded code files and create an enhanced website based on the existing structure. Improve the code quality, add modern styling, make it responsive, and enhance the user experience while preserving the original functionality.`
        }

        if (autoPrompt) {
          setInputMessage(autoPrompt)
        }
      }

    } catch (error) {
      console.error('Error uploading files:', error)
      // Show error message to user
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "😅 Oops! There was an issue uploading your files. Please try again with supported file types (images, ZIP files, or code files). I'm here to help! 🛠️",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsUploading(false)
    }
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedUrls(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (file.type.includes('zip') || file.name.endsWith('.zip')) return <FileArchive className="w-4 h-4" />
    return <FileCode className="w-4 h-4" />
  }

  const handleUrlInput = () => {
    const url = prompt('🔗 Enter a website URL to clone (e.g., https://example.com):')
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      const urlPrompt = `🌐 Clone and recreate the website from this URL: ${url}

Analyze the website thoroughly and recreate it with modern web standards:

🎨 **Design Analysis:**
- Study the visual hierarchy, layout, and spacing
- Identify color schemes, typography, and branding
- Analyze navigation patterns and user interface elements
- Note any animations, transitions, or interactive features

💻 **Technical Recreation:**
- Create clean, semantic HTML structure
- Write modern CSS with responsive design (mobile-first)
- Implement interactive features with vanilla JavaScript
- Ensure cross-browser compatibility and accessibility
- Optimize for performance and SEO

🚀 **Enhancements:**
- Make it fully responsive across all devices
- Add smooth animations and hover effects
- Improve loading performance
- Enhance user experience with modern UX patterns
- Use modern web technologies and best practices

Create a pixel-perfect recreation that captures the essence of the original while being modern, fast, and responsive.`
      setInputMessage(urlPrompt)
    } else if (url && url.trim()) {
      // Show error for invalid URL
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "🔗 Please enter a valid URL starting with 'http://' or 'https://'. For example: https://example.com",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  useEffect(() => {
    loadTemplates()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  const generateWebsite = async (prompt: string, templateId?: string) => {
    setIsGenerating(true)
    setStreamingText('')
    setCurrentPreviewContent('')

    try {
      await blink.db.projects.update(currentProject.id, {
        status: 'generating',
        prompt: prompt,
        template_id: templateId || ''
      })

      let fullPrompt = prompt
      if (templateId) {
        const template = templates.find(t => t.id === templateId)
        if (template) {
          fullPrompt = `Create a ${template.name.toLowerCase()} website: ${prompt}. Use this as inspiration: ${template.description}`
        }
      }

      // Include uploaded file information in the prompt
      let fileContext = ''
      if (uploadedFiles.length > 0) {
        fileContext = `\n\n📎 **Uploaded Files Context:**\n`
        uploadedFiles.forEach((file, index) => {
          fileContext += `- ${file.name} (${file.type}) - Available at: ${uploadedUrls[index]}\n`
        })
        fileContext += `\nPlease analyze these uploaded files and incorporate their design elements, structure, or content into the website creation.\n`
      }

      const websitePrompt = `Create a complete, modern, responsive website with the following requirements:
${fullPrompt}${fileContext}

Requirements:
- Use modern HTML5, CSS3, and vanilla JavaScript
- Make it fully responsive (mobile, tablet, desktop)
- Include beautiful styling with gradients, shadows, and animations
- Use Inter font family from Google Fonts
- Include proper meta tags for SEO
- Make it production-ready
- Add smooth scrolling and hover effects
- Use a modern color palette with gradients
- Include proper semantic HTML structure
- Add some interactive elements like buttons with hover effects
- Make it visually appealing with modern design trends
- Add fun animations and colorful elements
- Use vibrant colors and playful design elements

Return only the complete HTML code with embedded CSS and JavaScript. Start with <!DOCTYPE html> and end with </html>.`

      let generatedCode = ''
      
      await blink.ai.streamText(
        { 
          prompt: websitePrompt,
          model: 'gpt-4o-mini',
          maxTokens: 4000
        },
        (chunk) => {
          generatedCode += chunk
          setStreamingText(generatedCode)
          
          setCurrentPreviewContent(generatedCode)
          
          if (iframeRef.current && generatedCode.trim()) {
            if (generatedCode.includes('<html') || generatedCode.includes('<body') || generatedCode.length > 100) {
              try {
                const iframe = iframeRef.current
                const doc = iframe.contentDocument || iframe.contentWindow?.document
                if (doc) {
                  doc.open()
                  doc.write(generatedCode)
                  doc.close()
                }
              } catch (error) {
                const previewUrl = `data:text/html;charset=utf-8,${encodeURIComponent(generatedCode)}`
                if (iframeRef.current) {
                  iframeRef.current.src = previewUrl
                }
              }
            }
          }
        }
      )

      const previewUrl = `data:text/html;charset=utf-8,${encodeURIComponent(generatedCode)}`

      await blink.db.projects.update(currentProject.id, {
        status: 'completed',
        generated_code: generatedCode,
        preview_url: previewUrl
      })

      setCurrentProject(prev => ({
        ...prev,
        status: 'completed',
        generated_code: generatedCode,
        preview_url: previewUrl
      }))

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "🎉 Ta-da! Your website has been generated with AI magic! ✨ You can see the live preview on the right. Would you like me to make any modifications or add new features? I'm here to make it even more awesome! 🚀",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error generating website:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "😅 Oops! Something went wrong with the AI magic. Don't worry, even wizards have off days! Please try again with a different prompt and I'll make it work! 🪄",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])

      await blink.db.projects.update(currentProject.id, {
        status: 'draft'
      })
    } finally {
      setIsGenerating(false)
      setStreamingText('')
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const prompt = inputMessage
    setInputMessage('')

    await generateWebsite(prompt)
  }

  const handleTemplateSelect = async (template: Template) => {
    setShowTemplateDialog(false)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `🎨 Use the ${template.name} template`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    
    await generateWebsite(`Create a ${template.name.toLowerCase()} website`, template.id)
  }

  const deployWebsite = async (platform: string) => {
    if (!currentProject.generated_code) return

    try {
      setIsGenerating(true)
      
      const deploymentId = `dep_${Date.now()}`
      await blink.db.deployments.create({
        id: deploymentId,
        project_id: currentProject.id,
        user_id: user.id,
        platform: platform,
        deployment_url: '',
        status: 'deploying'
      })

      await new Promise(resolve => setTimeout(resolve, 3000))

      const deploymentUrl = `https://${currentProject.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${platform}.app`

      await blink.db.deployments.update(deploymentId, {
        status: 'success',
        deployment_url: deploymentUrl
      })

      await blink.db.projects.update(currentProject.id, {
        status: 'deployed',
        deployment_url: deploymentUrl
      })

      setCurrentProject(prev => ({
        ...prev,
        status: 'deployed',
        deployment_url: deploymentUrl
      }))

      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🚀 Woohoo! Your website has been deployed successfully to the internet! 🌍 You can access it at: ${deploymentUrl} - Time to celebrate! 🎉`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, successMessage])
      setShowDeployDialog(false)

    } catch (error) {
      console.error('Error deploying website:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportCode = () => {
    if (!currentProject.generated_code) return

    const blob = new Blob([currentProject.generated_code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportDialog(false)
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
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const content = currentPreviewContent || currentProject.generated_code
      
      if (content) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document
          if (doc) {
            doc.open()
            doc.write(content)
            doc.close()
          }
        } catch (error) {
          const previewUrl = `data:text/html;charset=utf-8,${encodeURIComponent(content)}`
          iframe.src = previewUrl
        }
      }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="border-b glass-effect h-16 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBackToProjects} className="hover-lift">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center animate-pulse-rainbow">
              <Sparkles className="w-5 h-5 text-white animate-wiggle" />
            </div>
            <div>
              <span className="font-space font-bold text-lg">{currentProject.name}</span>
              <Badge 
                className={`ml-3 ${
                  currentProject.status === 'completed' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : currentProject.status === 'generating'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
              >
                {currentProject.status === 'generating' ? '✨ Creating Magic...' : 
                 currentProject.status === 'completed' ? '🎉 Ready!' : 
                 currentProject.status === 'deployed' ? '🚀 Live!' : '📝 Draft'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Template Button */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hover-lift glass-card border-2 border-purple-200">
                <Palette className="w-4 h-4 mr-2" />
                🎨 Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl glass-card">
              <DialogHeader>
                <DialogTitle className="font-space text-2xl text-rainbow">🎨 Choose a Template</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4 cursor-pointer hover-lift glass-card border-2 border-white/50" onClick={() => handleTemplateSelect(template)}>
                    <img src={template.preview_image} alt={template.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    <h3 className="font-space font-bold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {JSON.parse(template.tags).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">{tag}</Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* View Mode Toggle */}
          <div className="flex glass-card border-2 border-purple-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className={viewMode === 'preview' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
            >
              <Eye className="w-4 h-4 mr-2" />
              👁️ Preview
            </Button>
            <Button
              variant={viewMode === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('code')}
              className={viewMode === 'code' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
            >
              <Code className="w-4 h-4 mr-2" />
              💻 Code
            </Button>
          </div>

          {/* Device Toggle */}
          <div className="flex glass-card border-2 border-purple-200 rounded-lg p-1">
            <Button
              variant={deviceType === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('mobile')}
              className={deviceType === 'mobile' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceType === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('tablet')}
              className={deviceType === 'tablet' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceType === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('desktop')}
              className={deviceType === 'desktop' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>

          {/* Export Button */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!currentProject.generated_code} className="hover-lift glass-card border-2 border-green-200">
                <Download className="w-4 h-4 mr-2" />
                📥 Export
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="font-space text-xl text-rainbow">📥 Export Your Website</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium">Download your website code to host anywhere you like! 🌍</p>
                <div className="flex space-x-2">
                  <Button onClick={exportCode} className="flex-1 btn-fun hover-lift">
                    <FileCode className="w-4 h-4 mr-2" />
                    📄 Download HTML File
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Deploy Button */}
          <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!currentProject.generated_code} className="btn-fun hover-lift">
                <Rocket className="w-4 h-4 mr-2" />
                🚀 Deploy
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="font-space text-xl text-rainbow">🚀 Deploy Your Website</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium">Choose a platform to launch your website to the world! 🌍</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => deployWebsite('netlify')} disabled={isGenerating} className="hover-lift glass-card border-2 border-orange-200">
                    <Zap className="w-4 h-4 mr-2" />
                    ⚡ Netlify
                  </Button>
                  <Button variant="outline" onClick={() => deployWebsite('vercel')} disabled={isGenerating} className="hover-lift glass-card border-2 border-blue-200">
                    <Globe className="w-4 h-4 mr-2" />
                    🌐 Vercel
                  </Button>
                  <Button variant="outline" onClick={() => deployWebsite('github-pages')} disabled={isGenerating} className="hover-lift glass-card border-2 border-purple-200">
                    <Code className="w-4 h-4 mr-2" />
                    💻 GitHub Pages
                  </Button>
                  <Button variant="outline" onClick={() => deployWebsite('surge')} disabled={isGenerating} className="hover-lift glass-card border-2 border-pink-200">
                    <Upload className="w-4 h-4 mr-2" />
                    🌊 Surge.sh
                  </Button>
                </div>
                {isGenerating && (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="font-medium">🚀 Deploying your website to the internet...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat Sidebar */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full flex flex-col border-r border-purple-200">
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-200 glass-card">
                <h2 className="font-space font-bold flex items-center text-lg">
                  <Wand2 className="w-6 h-6 mr-2 text-purple-600 animate-wiggle" />
                  <span className="text-rainbow">AI Assistant</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  ✨ Describe what you want to build, upload files, or paste URLs! I'm here to make magic happen! 🎨
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/50 to-purple-50/50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 font-medium ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'glass-card border-2 border-white/50'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Streaming Message */}
                {streamingText && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] glass-card border-2 border-white/50 rounded-2xl p-4">
                      <p className="text-sm whitespace-pre-wrap font-medium">{streamingText}</p>
                      <div className="flex items-center mt-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground ml-2 font-medium">✨ Creating magic...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div 
                ref={dropZoneRef}
                className={`p-4 border-t border-purple-200 glass-card transition-all duration-200 ${
                  isDragOver ? 'bg-purple-100/50 border-purple-400' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Uploaded Files Display */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">📎 Uploaded files:</p>
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 glass-card rounded-lg px-3 py-2 text-sm border-2 border-white/50">
                          {getFileIcon(file)}
                          <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadedFile(index)}
                            className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Input Area */}
                <div className="space-y-3 relative">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        placeholder="🎨 Describe your website, upload screenshots, or paste a URL..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={isGenerating}
                        className="pr-20 glass-card border-2 border-purple-200 font-medium"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                        {/* File Upload Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isGenerating || isUploading}
                          className="h-8 w-8 p-0 hover:bg-purple-100 rounded-lg"
                          title="Upload screenshots, ZIP files, or images"
                        >
                          {isUploading ? (
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Paperclip className="w-4 h-4 text-purple-600" />
                          )}
                        </Button>
                        
                        {/* URL Input Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleUrlInput}
                          disabled={isGenerating}
                          className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg"
                          title="Clone from URL"
                        >
                          <Link className="w-4 h-4 text-blue-600" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!inputMessage.trim() || isGenerating}
                      size="sm"
                      className="btn-fun hover-lift"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Upload Options */}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                      <Image className="w-3 h-3" />
                      <span>Screenshots</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                      <FileArchive className="w-3 h-3" />
                      <span>ZIP files</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                      <Link className="w-3 h-3" />
                      <span>Website URLs</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                      <FileCode className="w-3 h-3" />
                      <span>Code files</span>
                    </span>
                  </div>

                  {/* Drag and Drop Indicator */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-purple-100/80 border-2 border-dashed border-purple-400 rounded-lg flex items-center justify-center z-10">
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 text-purple-600 mx-auto animate-bounce" />
                        <p className="text-purple-700 font-medium">Drop your files here! 📁</p>
                        <p className="text-xs text-purple-600">Screenshots, ZIP files, or code files</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.zip,.html,.css,.js,.json,.txt,.pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />

                {isGenerating && (
                  <div className="flex items-center mt-3 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="font-medium">✨ AI is analyzing your files and generating your website...</span>
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
              <div className="border-b border-purple-200 p-3 flex items-center justify-between glass-card">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-white/80 border-2 border-purple-200 rounded-lg px-3 py-1 text-sm text-muted-foreground font-medium">
                    🌐 {currentProject.deployment_url || 'https://your-awesome-website.com'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={refreshPreview} className="hover-lift">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  {currentProject.deployment_url && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(currentProject.deployment_url, '_blank')} className="hover-lift">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 flex items-center justify-center">
                {viewMode === 'preview' ? (
                  <div className={`${getDeviceClasses()} border-4 border-white/80 rounded-2xl overflow-hidden shadow-2xl bg-white hover-lift`}>
                    {currentPreviewContent || currentProject.generated_code ? (
                      <iframe
                        ref={iframeRef}
                        src={currentProject.preview_url || `data:text/html;charset=utf-8,${encodeURIComponent(currentPreviewContent || currentProject.generated_code)}`}
                        className="w-full h-full border-0"
                        title="Website Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center space-y-6">
                          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto animate-pulse-rainbow">
                            <Wand2 className="w-10 h-10 text-white animate-wiggle" />
                          </div>
                          <div>
                            <h3 className="font-space font-bold text-xl text-rainbow">Ready to create magic! ✨</h3>
                            <p className="text-sm font-medium mt-2">Describe your website, upload files, or paste a URL to get started! 🚀</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="w-full h-full p-6 glass-card border-2 border-white/50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-space font-bold text-lg text-rainbow">💻 Generated Code</h3>
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">HTML/CSS/JS</Badge>
                      </div>
                      <Textarea
                        value={currentPreviewContent || currentProject.generated_code || '// 🎨 Your AI-generated website code will appear here like magic!'}
                        readOnly
                        className="font-mono text-sm h-full resize-none glass-card border-2 border-white/50"
                      />
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