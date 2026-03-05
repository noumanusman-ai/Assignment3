interface StatsCardsProps {
  totalUsers: number;
  totalDocuments: number;
  totalConversations: number;
}

export function StatsCards({
  totalUsers,
  totalDocuments,
  totalConversations,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: "groups",
    },
    {
      label: "Conversations",
      value: totalConversations.toLocaleString(),
      icon: "sensors",
    },
    {
      label: "Documents Indexed",
      value: totalDocuments.toLocaleString(),
      icon: "database",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#18181b] border border-[#27272a] p-5 rounded-xl shadow-sm hover:border-slate-700 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <span className="material-symbols-outlined text-[#6366f1]">
              {stat.icon}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        </div>
      ))}
    </section>
  );
}
