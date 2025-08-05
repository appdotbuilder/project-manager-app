
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Activity, User } from '../../../server/src/schema';

interface KanbanBoardProps {
  activities: Activity[];
  users: User[];
  onUpdateStatus: (activityId: number, status: string) => Promise<void>;
}

type StatusColumn = {
  id: 'todo' | 'in_progress' | 'review' | 'done';
  title: string;
  emoji: string;
  color: string;
};

const statusColumns: StatusColumn[] = [
  { id: 'todo', title: 'To Do', emoji: '📝', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', emoji: '⚡', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', emoji: '👀', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', emoji: '✅', color: 'bg-green-100' }
];

export function KanbanBoard({ activities, onUpdateStatus }: KanbanBoardProps) {
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null);

  const getActivitiesByStatus = (status: string) => {
    return activities.filter((activity: Activity) => activity.status === status);
  };

  const handleDragStart = (e: React.DragEvent, activity: Activity) => {
    setDraggedActivity(activity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedActivity && draggedActivity.status !== newStatus) {
      await onUpdateStatus(draggedActivity.id, newStatus);
    }
    setDraggedActivity(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusColumns.map((column: StatusColumn) => (
        <div
          key={column.id}
          className={`${column.color} rounded-lg p-4 min-h-[400px]`}
          onDragOver={handleDragOver}
          onDrop={(e: React.DragEvent) => handleDrop(e, column.id)}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{column.emoji}</span>
            <h3 className="font-semibold text-gray-800">{column.title}</h3>
            <Badge variant="secondary" className="ml-auto">
              {getActivitiesByStatus(column.id).length}
            </Badge>
          </div>

          <div className="space-y-3">
            {getActivitiesByStatus(column.id).map((activity: Activity) => (
              <Card
                key={activity.id}
                className="cursor-move hover:shadow-md transition-shadow bg-white"
                draggable
                onDragStart={(e: React.DragEvent) => handleDragStart(e, activity)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {activity.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {activity.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Start: {format(activity.start_date, 'MMM dd')}</span>
                      <span>End: {format(activity.end_date, 'MMM dd')}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      ID: #{activity.id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {getActivitiesByStatus(column.id).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <div className="text-3xl mb-2">{column.emoji}</div>
                <p className="text-sm">Drop activities here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
