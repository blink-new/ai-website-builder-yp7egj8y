import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import EnhancedLandingPage from './components/EnhancedLandingPage'
import ProjectManager from './components/ProjectManager'
import EnhancedProjectBuilder from './components/EnhancedProjectBuilder'

interface User {
  id: string
  email: string
  displayName?: string
}

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

type AppView = 'landing' | 'projects' | 'builder'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleStartBuilding = async (prompt?: string, templateId?: string) => {
    if (!user) return

    try {
      // Create a new project
      const newProject = await blink.db.projects.create({
        id: `proj_${Date.now()}`,
        user_id: user.id,
        name: prompt ? `${prompt.slice(0, 50)}...` : 'New Website',
        description: prompt || '',
        prompt: prompt || '',
        generated_code: '',
        preview_url: '',
        deployment_url: '',
        template_id: templateId || '',
        status: 'draft'
      })

      setCurrentProject(newProject)
      setCurrentView('builder')
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project)
    setCurrentView('builder')
  }

  const handleBackToProjects = () => {
    setCurrentView('projects')
    setCurrentProject(null)
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
    setCurrentProject(null)
  }

  const handleViewProjects = () => {
    setCurrentView('projects')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Loading AI Builder</h2>
            <p className="text-muted-foreground">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Website Builder</h1>
            <p className="text-muted-foreground mb-6">
              Create stunning websites with the power of AI
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In to Get Started
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'landing' && (
        <EnhancedLandingPage
          user={user}
          onStartBuilding={handleStartBuilding}
          onViewProjects={handleViewProjects}
        />
      )}
      
      {currentView === 'projects' && (
        <div className="min-h-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToLanding}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Home</span>
              </button>
              <div className="w-px h-6 bg-border"></div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 gradient-bg rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-semibold">AI Builder</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user.displayName || user.email}
              </span>
              <button
                onClick={() => blink.auth.logout()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </button>
            </div>
          </header>
          <div className="container mx-auto px-4 py-8">
            <ProjectManager
              user={user}
              onCreateProject={handleStartBuilding}
              onOpenProject={handleOpenProject}
            />
          </div>
        </div>
      )}
      
      {currentView === 'builder' && currentProject && (
        <EnhancedProjectBuilder
          user={user}
          project={currentProject}
          onBackToProjects={handleBackToProjects}
        />
      )}
    </div>
  )
}

export default App