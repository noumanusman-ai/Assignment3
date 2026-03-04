import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessagesSquare } from "lucide-react";

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
    { label: "Total Users", value: totalUsers, icon: Users },
    { label: "Documents", value: totalDocuments, icon: FileText },
    { label: "Conversations", value: totalConversations, icon: MessagesSquare },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
