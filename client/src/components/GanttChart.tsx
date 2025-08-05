
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import type { Activity } from '../../../server/src/schema';

interface GanttChartProps {
  activities: Activity[];
}

export function GanttChart({ activities }: GanttChartProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">📊</div>
          <p className="text-gray-500">No activities to display in Gantt chart</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate date range
  const allDates = activities.flatMap((activity: Activity) => [
    activity.start_date,
    activity.end_date
  ]);
  const minDate = new Date(Math.min(...allDates.map((date: Date) => date.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((date: Date) => date.getTime())));
  const totalDays = differenceInDays(maxDate, minDate) + 1;

  // Generate date headers (showing every 7th day to avoid clutter)
  const dateHeaders = [];
  const currentDate = new Date(minDate);
  for (let i = 0; i < totalDays; i += 7) {
    dateHeaders.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-400';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'todo': return '📝';
      case 'in_progress': return '⚡';
      case 'review': return '👀';
      case 'done': return '✅';
      default: return '📋';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Gantt Chart Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Date headers */}
            <div className="flex border-b mb-4 pb-2">
              <div className="w-64 flex-shrink-0 font-medium text-sm text-gray-600">
                Activity
              </div>
              <div className="flex-1 flex">
                {dateHeaders.map((date: Date, index: number) => (
                  <div
                    key={index}
                    className="flex-1 text-xs text-center text-gray-500 px-1"
                  >
                    {format(date, 'MMM dd')}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity rows */}
            <div className="space-y-3">
              {activities.map((activity: Activity) => {
                const startOffset = differenceInDays(activity.start_date, minDate);
                const duration = differenceInDays(activity.end_date, activity.start_date) + 1;
                const leftPercentage = (startOffset / totalDays) * 100;
                const widthPercentage = (duration / totalDays) * 100;

                return (
                  <div key={activity.id} className="flex items-center">
                    <div className="w-64 flex-shrink-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span>{getStatusEmoji(activity.status)}</span>
                        <div>
                          <p className="font-medium text-sm truncate">
                            {activity.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(activity.status)} text-white border-0`}
                            >
                              {activity.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 relative h-8">
                      <div className="absolute inset-0 bg-gray-100 rounded"></div>
                      <div
                        className={`absolute h-6 mt-1 rounded ${getStatusColor(activity.status)} opacity-80 hover:opacity-100 transition-opacity`}
                        style={{
                          left: `${leftPercentage}%`,
                          width: `${Math.max(widthPercentage, 2)}%`
                        }}
                        title={`${activity.name}: ${format(activity.start_date, 'MMM dd')} - ${format(activity.end_date, 'MMM dd')}`}
                      >
                        <div className="h-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium px-1 truncate">
                            {duration}d
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status Legend:</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { status: 'todo', label: 'To Do', emoji: '📝' },
                  { status: 'in_progress', label: 'In Progress', emoji: '⚡' },
                  { status: 'review', label: 'Review', emoji: '👀' },
                  { status: 'done', label: 'Done', emoji: '✅' }
                ].map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${getStatusColor(item.status)}`}></div>
                    <span className="text-xs text-gray-600">
                      {item.emoji} {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
