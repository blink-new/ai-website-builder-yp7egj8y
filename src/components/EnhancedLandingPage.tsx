import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Smartphone, 
  Code, 
  Palette,
  ArrowRight,
  Play,
  Download,
  Users,
  Star,
  TrendingUp,
  Shield,
  Rocket,
  Heart,
  Coffee,
  Rainbow,
  Smile,
  PartyPopper,
  Wand2,
  Paperclip,
  Link,
  Image,
  FileArchive,
  FileCode,
  X
} from 'lucide-react'
import { blink } from '../blink/client'

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

interface EnhancedLandingPageProps {
  user: {
    id: string
    email: string
    displayName?: string
  }
  onStartBuilding: (prompt?: string, templateId?: string) => void
  onViewProjects: () => void
}

const features = [
  {
    icon: Wand2,
    title: "✨ AI Magic Generation",
    description: "Describe your wildest website dreams and watch our AI wizard make them come true instantly!",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "⚡ Lightning Fast",
    description: "From zero to hero in seconds! Build stunning websites faster than you can say 'abracadabra'",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: Rainbow,
    title: "🌈 Responsive Magic",
    description: "Every website works perfectly on all devices - phones, tablets, laptops, even smart fridges!",
    color: "from-green-400 to-blue-500"
  },
  {
    icon: Code,
    title: "🎨 Clean Code Export",
    description: "Export beautiful, production-ready code that even your developer friends will be jealous of",
    color: "from-blue-500 to-purple-500"
  },
  {
    icon: Rocket,
    title: "🚀 One-Click Deploy",
    description: "Launch your website to the moon with one click! Deploy anywhere, anytime, any universe",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "🛡️ SEO Supercharged",
    description: "Built-in SEO superpowers to make Google fall in love with your website at first sight",
    color: "from-indigo-500 to-purple-500"
  }
]

const stats = [
  { label: "Websites Created", value: "50,000+", icon: Globe, emoji: "🌍" },
  { label: "Happy Users", value: "12,000+", icon: Users, emoji: "😊" },
  { label: "Templates Available", value: "100+", icon: Palette, emoji: "🎨" },
  { label: "Success Rate", value: "99.9%", icon: TrendingUp, emoji: "📈" }
]

const funPhrases = [
  "Create a mind-blowing portfolio for a space photographer",
  "Build an epic e-commerce store for magical potions",
  "Design a restaurant website that makes people drool",
  "Make a blog about cats wearing tiny hats",
  "Build a landing page for time travel services"
]

export default function EnhancedLandingPage({ user, onStartBuilding, onViewProjects }: EnhancedLandingPageProps) {
  const [prompt, setPrompt] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const loadTemplates = async () => {
    try {
      const allTemplates = await blink.db.templates.list({
        orderBy: { is_featured: 'desc' }
      })
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    const newFiles: File[] = []

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
      }

      setUploadedFiles(prev => [...prev, ...newFiles])

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
          setPrompt(autoPrompt)
        }
      }

    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again with supported file types (images, ZIP files, or code files).')
    } finally {
      setIsUploading(false)
    }
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
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
      setPrompt(urlPrompt)
    } else if (url && url.trim()) {
      alert("🔗 Please enter a valid URL starting with 'http://' or 'https://'. For example: https://example.com")
    }
  }

  useEffect(() => {
    loadTemplates()
    
    // Rotate fun phrases
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % funPhrases.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleQuickStart = (templateId: string, templateName: string) => {
    onStartBuilding(`Create a ${templateName.toLowerCase()} website`, templateId)
  }

  const handleCustomPrompt = () => {
    if (prompt.trim()) {
      onStartBuilding(prompt)
    }
  }

  const categories = ['all', ...new Set(templates.map(t => t.category))]
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const featuredTemplates = templates.filter(t => Number(t.is_featured) > 0).slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="border-b glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center animate-pulse-rainbow">
              <Sparkles className="w-6 h-6 text-white animate-wiggle" />
            </div>
            <span className="font-space font-bold text-2xl text-rainbow">AI Builder</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onViewProjects} className="hover-lift">
              <Rocket className="w-4 h-4 mr-2" />
              My Projects
            </Button>
            <span className="text-sm text-muted-foreground">
              Hey there, {user.displayName || user.email}! 👋
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => blink.auth.logout()}
              className="hover-glow"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 gradient-bg-fun text-white relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-300/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-blue-300/20 blob-shape animate-float" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
          <div className="space-y-6 animate-bounce-in">
            <Badge variant="secondary" className="mb-4 glass-effect text-white border-white/30 animate-wiggle">
              <PartyPopper className="w-4 h-4 mr-2" />
              Powered by Super Smart AI Magic ✨
            </Badge>
            <h1 className="text-6xl md:text-7xl font-space font-bold tracking-tight">
              Build 
              <span className="block text-yellow-300 animate-pulse">
                AMAZING
              </span>
              websites with
              <span className="block bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent">
                AI superpowers! 🚀
              </span>
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
              Transform your wildest ideas into stunning, responsive websites using natural language. 
              No coding required, just describe what you want and watch the magic happen! ✨
            </p>
          </div>

          {/* Enhanced AI Prompt Input */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white/80 rounded-lg px-3 py-2 text-sm text-gray-700">
                      {getFileIcon(file)}
                      <span className="truncate max-w-[120px]">{file.name}</span>
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

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder={funPhrases[currentPhrase]}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-lg h-16 flex-1 bg-white/90 border-2 border-white/50 text-gray-800 placeholder:text-gray-500 rounded-xl font-medium pr-24"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomPrompt()}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1">
                    {/* File Upload Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isUploading}
                      className="h-10 w-10 p-0 hover:bg-purple-100 rounded-lg"
                      title="Upload screenshots, ZIP files, or images"
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Paperclip className="w-5 h-5 text-purple-600" />
                      )}
                    </Button>
                    
                    {/* URL Input Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUrlInput}
                      className="h-10 w-10 p-0 hover:bg-blue-100 rounded-lg"
                      title="Clone from URL"
                    >
                      <Link className="w-5 h-5 text-blue-600" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={handleCustomPrompt}
                  disabled={!prompt.trim()}
                  className="h-16 px-8 btn-fun rounded-xl font-bold text-lg hover-lift"
                >
                  <Wand2 className="w-6 h-6 mr-2" />
                  Create Magic! ✨
                </Button>
              </div>

              {/* Upload Options */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                  <Image className="w-4 h-4" />
                  <span>Screenshots</span>
                </span>
                <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                  <FileArchive className="w-4 h-4" />
                  <span>ZIP files</span>
                </span>
                <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                  <Link className="w-4 h-4" />
                  <span>Website URLs</span>
                </span>
                <span className="flex items-center space-x-1 bg-white/60 rounded-full px-3 py-1">
                  <FileCode className="w-4 h-4" />
                  <span>Code files</span>
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.zip,.html,.css,.js,.json,.txt,.pdf"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            <p className="text-sm opacity-80 font-medium">
              Try something fun like: "{funPhrases[currentPhrase]}" 🎨
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-16 h-16 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-3 hover-lift">
                  <span className="text-2xl">{stat.emoji}</span>
                </div>
                <div className="text-3xl font-bold font-space">{stat.value}</div>
                <div className="text-sm opacity-80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-white via-purple-50 to-pink-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-space font-bold mb-4 text-rainbow">
              Why choose AI Builder? 🤔
            </h2>
            <p className="text-muted-foreground text-xl font-medium">
              The most advanced AI-powered website builder with professional results and a sprinkle of fun! ✨
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 hover-lift glass-card border-2 border-white/50 animate-bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="space-y-6 p-0">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto hover-glow transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-space font-bold text-xl">{feature.title}</h3>
                  <p className="text-muted-foreground font-medium">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-space font-bold mb-4 text-rainbow">
              Professional Templates 🎨
            </h2>
            <p className="text-muted-foreground text-xl font-medium">
              Get started instantly with our professionally designed templates that don't suck! 🚀
            </p>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 glass-effect border-2 border-white/30">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="capitalize font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  {category === 'all' ? '✨ All' : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Featured Templates */}
          {selectedCategory === 'all' && (
            <div className="mb-16">
              <h3 className="text-2xl font-space font-bold mb-8 flex items-center">
                <Star className="w-6 h-6 mr-3 text-yellow-500 animate-wiggle" />
                Featured Templates ⭐
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredTemplates.map((template, index) => (
                  <Card key={template.id} className="overflow-hidden hover-lift glass-card border-2 border-white/50 cursor-pointer animate-bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={template.preview_image} 
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-space font-bold text-lg">{template.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 font-medium">{template.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(template.tags).slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full btn-goofy border-2 hover-lift"
                        onClick={() => handleQuickStart(template.id, template.name)}
                      >
                        Use Template 🚀
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden glass-card animate-pulse">
                  <div className="aspect-video bg-gradient-to-r from-purple-200 to-pink-200"></div>
                  <CardContent className="p-6 space-y-3">
                    <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded"></div>
                    <div className="h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded"></div>
                    <div className="h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredTemplates.map((template, index) => (
                <Card key={template.id} className="overflow-hidden hover-lift glass-card border-2 border-white/50 cursor-pointer animate-bounce-in" style={{animationDelay: `${index * 0.05}s`}}>
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={template.preview_image} 
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-space font-bold">{template.name}</h4>
                        {Number(template.is_featured) > 0 && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current animate-wiggle" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-medium">{template.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(template.tags).slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full btn-goofy border-2 hover-lift"
                      onClick={() => handleQuickStart(template.id, template.name)}
                    >
                      Use Template 🎨
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-bg-fun relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-300/20 blob-shape animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-pink-300/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container mx-auto max-w-4xl text-center text-white relative z-10">
          <div className="animate-bounce-in">
            <h2 className="text-5xl font-space font-bold mb-6">
              Ready to build something 
              <span className="block text-yellow-300">ABSOLUTELY AMAZING? 🚀</span>
            </h2>
            <p className="text-xl mb-10 opacity-90 font-medium">
              Join thousands of creators who are building the web with AI magic! ✨
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={() => onStartBuilding()}
                className="text-xl px-12 py-6 btn-fun font-bold hover-lift rounded-2xl"
              >
                <Wand2 className="w-6 h-6 mr-3" />
                Start Building Magic! ✨
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={onViewProjects}
                className="text-xl px-12 py-6 border-2 border-white/50 text-white hover:bg-white/10 font-bold hover-lift rounded-2xl glass-effect"
              >
                <Rocket className="w-6 h-6 mr-3" />
                View My Projects 🚀
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}