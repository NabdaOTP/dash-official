import { AnalyticsOverview } from "@/features/analytics/components/analytics-overview";
import { MessagesBreakdown } from "@/features/analytics/components/messages-breakdown";
import { UsageCard } from "@/features/analytics/components/usage-card";
import { QuickActions } from "@/features/analytics/components/quick-actions";
import { RecentActivity } from "@/features/analytics/components/recent-activity";

export default function ProjectDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Project Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor your project performance and usage
        </p>
      </div>

      {/* Stats overview */}
      <AnalyticsOverview />

      {/* Performance + Usage row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <MessagesBreakdown />
        </div>
        <div>
          <UsageCard />
        </div>
      </div>

      {/* Recent activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}