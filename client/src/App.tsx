
import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, Kanban } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { ProjectForm } from '@/components/ProjectForm';
import { ActivityForm } from '@/components/ActivityForm';
import { KanbanBoard } from '@/components/KanbanBoard';
import { GanttChart } from '@/components/GanttChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Project, Activity, User, CreateProjectInput, CreateActivityInput } from '../../server/src/schema';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projectsResult, usersResult] = await Promise.all([
        trpc.getProjects.query(),
        trpc.getUsers.query()
      ]);
      setProjects(projectsResult);
      setUsers(usersResult);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load activities for selected project
  const loadActivities = useCallback(async () => {
    if (!selectedProject) return;
    
    try {
      const activitiesResult = await trpc.getProjectActivities.query({
        project_id: selectedProject.id
      });
      setActivities(activitiesResult);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleCreateProject = async (projectData: CreateProjectInput) => {
    try {
      const newProject = await trpc.createProject.mutate(projectData);
      setProjects((prev: Project[]) => [...prev, newProject]);
      setIsProjectDialogOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCreateActivity = async (activityData: CreateActivityInput) => {
    try {
      const newActivity = await trpc.createActivity.mutate(activityData);
      setActivities((prev: Activity[]) => [...prev, newActivity]);
      setIsActivityDialogOpen(false);
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleUpdateActivityStatus = async (activityId: number, status: string) => {
    try {
      await trpc.updateActivityStatus.mutate({
        id: activityId,
        status: status as 'todo' | 'in_progress' | 'review' | 'done'
      });
      setActivities((prev: Activity[]) =>
        prev.map((activity: Activity) =>
          activity.id === activityId
            ? { ...activity, status: status as 'todo' | 'in_progress' | 'review' | 'done' }
            : activity
        )
      );
    } catch (error) {
      console.error('Failed to update activity status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Project Manager</h1>
          <p className="text-gray-600">Organize your projects, track activities, and collaborate with your team</p>
        </div>

        {/* Project Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Projects</h2>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <ProjectForm onSubmit={handleCreateProject} />
              </DialogContent>
            </Dialog>
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">📋</div>
                <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
                <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Note: Backend handlers are stub implementations - data won't persist
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: Project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProject?.id === project.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📁 {project.name}
                    </CardTitle>
                    {project.description && (
                      <CardDescription>{project.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">
                      Created: {project.created_at.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Project Activities */}
        {selectedProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                Activities for "{selectedProject.name}"
              </h2>
              <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Activity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Activity</DialogTitle>
                  </DialogHeader>
                  <ActivityForm
                    projectId={selectedProject.id}
                    users={users}
                    activities={activities}
                    onSubmit={handleCreateActivity}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="kanban" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="kanban" className="flex items-center gap-2">
                  <Kanban className="w-4 h-4" />
                  Kanban Board
                </TabsTrigger>
                <TabsTrigger value="gantt" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Gantt Chart
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Activity List
                </TabsTrigger>
              </TabsList>

              <TabsContent value="kanban" className="mt-6">
                <KanbanBoard
                  activities={activities}
                  users={users}
                  onUpdateStatus={handleUpdateActivityStatus}
                />
              </TabsContent>

              <TabsContent value="gantt" className="mt-6">
                <GanttChart activities={activities} />
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                {activities.length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-400 mb-4">📝</div>
                      <p className="text-gray-500">No activities yet. Create your first activity!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity: Activity) => (
                      <Card key={activity.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>📋 {activity.name}</span>
                            <Badge
                              variant={
                                activity.status === 'done'
                                  ? 'default'
                                  : activity.status === 'in_progress'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {activity.status.replace('_', ' ')}
                            </Badge>
                          </CardTitle>
                          {activity.description && (
                            <CardDescription>{activity.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Start: {activity.start_date.toLocaleDateString()}</span>
                            <span>End: {activity.end_date.toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Footer note about stub implementation */}
        <div className="mt-12 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            ⚠️ <strong>Development Note:</strong> This application is using stub backend implementations. 
            All data operations (create, read, update) are functional but data won't persist between sessions. 
            The UI demonstrates full functionality including drag-and-drop Kanban boards and Gantt chart visualization.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
