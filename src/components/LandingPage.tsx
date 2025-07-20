import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Smartphone, 
  Code, 
  Palette,
  ArrowRight,
  Play
} from 'lucide-react'

interface LandingPageProps {
  user: {
    id: string
    email: string
    displayName?: string
  }
  onStartBuilding: () => void
}

const templates = [
  {
    id: 1,
    name: "Modern Portfolio",
    description: "Clean, professional portfolio website",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    tags: ["Portfolio", "Creative"]
  },
  {
    id: 2,
    name: "SaaS Landing",
    description: "High-converting SaaS product page",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    tags: ["Business", "SaaS"]
  },
  {
    id: 3,
    name: "E-commerce Store",
    description: "Modern online store with cart",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    tags: ["E-commerce", "Store"]
  },
  {
    id: 4,
    name: "Blog Platform",
    description: "Content-focused blog design",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
    tags: ["Blog", "Content"]
  }
]

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Describe your vision and watch AI create your website instantly"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Go from idea to live website in minutes, not hours"
  },
  {
    icon: Globe,
    title: "Responsive Design",
    description: "Every website works perfectly on all devices automatically"
  },
  {
    icon: Code,
    title: "Clean Code",
    description: "Export production-ready code that developers love"
  }
]

export default function LandingPage({ user, onStartBuilding }: LandingPageProps) {
  const [prompt, setPrompt] = useState('')

  const handleQuickStart = (templateName: string) => {
    setPrompt(`Create a ${templateName.toLowerCase()} website`)
    onStartBuilding()
  }

  const handleCustomPrompt = () => {
    if (prompt.trim()) {
      onStartBuilding()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AI Builder</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.displayName || user.email}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => blink.auth.logout()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Build websites with
              <span className="gradient-bg bg-clip-text text-transparent block">
                AI assistance
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your ideas into beautiful, responsive websites using natural language. 
              No coding required, just describe what you want.
            </p>
          </div>

          {/* AI Prompt Input */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Describe the website you want to build..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-lg h-14 flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomPrompt()}
              />
              <Button 
                size="lg" 
                onClick={handleCustomPrompt}
                disabled={!prompt.trim()}
                className="h-14 px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Build
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Try: "Create a modern portfolio for a photographer" or "Build an e-commerce store for handmade jewelry"
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why choose AI Builder?</h2>
            <p className="text-muted-foreground text-lg">
              The fastest way to bring your web ideas to life
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4 p-0">
                  <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start Templates</h2>
            <p className="text-muted-foreground text-lg">
              Get started instantly with our pre-designed templates
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => handleQuickStart(template.name)}
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-bg">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to build something amazing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who are building the web with AI
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={onStartBuilding}
            className="text-lg px-8 py-4"
          >
            Start Building Now
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}