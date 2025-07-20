import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Code,
  Download,
  Globe,
  Trash2,
  Edit,
  Calendar,
  Folder,
  Sparkles
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

interface ProjectManagerProps {
  user: {
    id: string
    email: string
    displayName?: string
  }
  onCreateProject: () => void
  onOpenProject: (project: Project) => void
}

export default function ProjectManager({ user, onCreateProject, onOpenProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const loadProjects = useCallback(async () => {
    try {
      const userProjects = await blink.db.projects.list({
        where: { user_id: user.id },
        orderBy: { updated_at: 'desc' }
      })
      setProjects(userProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadProjects()
  }, [user.id, loadProjects])

  const createProject = async () => {
    if (!newProjectName.trim()) return

    try {
      const newProject = await blink.db.projects.create({
        id: `proj_${Date.now()}`,
        user_id: user.id,
        name: newProjectName,
        description: newProjectDescription,
        prompt: '',
        generated_code: '',
        preview_url: '',
        deployment_url: '',
        template_id: '',
        status: 'draft'
      })

      setProjects(prev => [newProject, ...prev])
      setShowCreateDialog(false)
      setNewProjectName('')
      setNewProjectDescription('')
      onOpenProject(newProject)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await blink.db.projects.delete(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'generating': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'deployed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Manage your AI-generated websites</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  placeholder="My Awesome Website"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  placeholder="A brief description of your project"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createProject} disabled={!newProjectName.trim()}>
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="generating">Generating</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="deployed">Deployed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto">
              <Folder className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No projects found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first AI-powered website'
                }
              </p>
            </div>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={onCreateProject}>
                <Sparkles className="w-4 h-4 mr-2" />
                Start Building
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenProject(project)}
                    className="flex-1 mr-2"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <div className="flex space-x-1">
                    {project.preview_url && (
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {project.generated_code && (
                      <Button variant="ghost" size="sm">
                        <Code className="w-4 h-4" />
                      </Button>
                    )}
                    {project.deployment_url && (
                      <Button variant="ghost" size="sm">
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}