function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
}

interface Activity {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: Date;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-[#27272a] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#27272a] bg-slate-900/40">
        <h4 className="font-semibold text-sm">Recent Activity</h4>
      </div>

      <div className="divide-y divide-[#27272a]">
        {activities.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-500">
            No recent activity.
          </div>
        )}
        {activities.map((activity, i) => (
          <div
            key={i}
            className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full ${activity.iconBg} ${activity.iconColor} flex items-center justify-center`}
              >
                <span className="material-symbols-outlined text-sm">
                  {activity.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-slate-500">
                  {activity.description}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-600 shrink-0 ml-4">
              {timeAgo(activity.time)}
            </span>
          </div>
        ))}
      </div>

      {activities.length > 0 && (
        <div className="px-6 py-3 bg-slate-900/40 border-t border-[#27272a] text-center">
          <span className="text-xs text-[#6467f2] font-medium">
            Showing latest {activities.length} events
          </span>
        </div>
      )}
    </div>
  );
}
