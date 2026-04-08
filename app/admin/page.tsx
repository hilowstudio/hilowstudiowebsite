import { supabase } from "@/lib/supabase";
import type { ContactStage } from "@/lib/types/database";

async function getDashboardStats() {
  const [contactsRes, postsRes, upcomingRes, recentActivityRes] = await Promise.all([
    supabase.from("contacts").select("stage"),
    supabase
      .from("content_posts")
      .select("id, status")
      .in("status", ["draft", "scheduled"]),
    supabase
      .from("content_posts")
      .select("id, title, body, scheduled_at, post_type")
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(5),
    supabase
      .from("activities")
      .select("id, type, description, created_at, contact_id")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const contacts = contactsRes.data || [];
  const stageCounts: Record<string, number> = {};
  for (const c of contacts) {
    stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
  }

  const posts = postsRes.data || [];
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;

  return {
    pipeline: {
      total: contacts.length,
      stages: stageCounts as Record<ContactStage, number>,
    },
    content: { drafts, scheduled },
    upcomingPosts: upcomingRes.data || [],
    recentActivity: recentActivityRes.data || [],
  };
}

const stageLabels: Record<ContactStage, string> = {
  lead: "Leads",
  engaged: "Engaged",
  call_booked: "Calls Booked",
  proposal_sent: "Proposals",
  won: "Won",
  lost: "Lost",
};

const stageColors: Record<ContactStage, string> = {
  lead: "bg-paper-muted text-ink-muted",
  engaged: "bg-clay-muted/20 text-clay",
  call_booked: "bg-clay/20 text-clay",
  proposal_sent: "bg-moss/20 text-moss",
  won: "bg-moss/30 text-moss",
  lost: "bg-terracotta/20 text-terracotta",
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-ink">Dashboard</h1>

      {/* Pipeline Summary */}
      <section>
        <h2 className="text-sm font-medium text-ink-muted mb-3 uppercase tracking-wide">
          Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(stageLabels) as ContactStage[]).map((stage) => (
            <div
              key={stage}
              className="rounded-lg border border-paper-muted p-4"
            >
              <p className="text-2xl font-serif text-ink">
                {stats.pipeline.stages[stage] || 0}
              </p>
              <p className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${stageColors[stage]}`}>
                {stageLabels[stage]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Content Summary */}
      <section>
        <h2 className="text-sm font-medium text-ink-muted mb-3 uppercase tracking-wide">
          Content Queue
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <div className="rounded-lg border border-paper-muted p-4">
            <p className="text-2xl font-serif text-ink">{stats.content.drafts}</p>
            <p className="text-xs text-ink-muted mt-1">Drafts</p>
          </div>
          <div className="rounded-lg border border-paper-muted p-4">
            <p className="text-2xl font-serif text-ink">{stats.content.scheduled}</p>
            <p className="text-xs text-ink-muted mt-1">Scheduled</p>
          </div>
        </div>
      </section>

      {/* Upcoming Posts */}
      {stats.upcomingPosts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-ink-muted mb-3 uppercase tracking-wide">
            Upcoming Posts
          </h2>
          <div className="space-y-2">
            {stats.upcomingPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-lg border border-paper-muted p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">
                    {post.title || post.body.slice(0, 80)}
                  </p>
                  <p className="text-xs text-ink-light mt-0.5">{post.post_type}</p>
                </div>
                <p className="text-xs text-ink-muted shrink-0 ml-4">
                  {post.scheduled_at
                    ? new Date(post.scheduled_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-ink-muted mb-3 uppercase tracking-wide">
            Recent Activity
          </h2>
          <div className="space-y-1">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <span className="text-ink-light text-xs shrink-0">
                  {new Date(activity.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-ink-muted">{activity.type.replace(/_/g, " ")}</span>
                {activity.description && (
                  <span className="text-ink truncate">{activity.description}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {stats.pipeline.total === 0 && stats.content.drafts === 0 && stats.content.scheduled === 0 && (
        <div className="text-center py-16">
          <p className="text-ink-muted text-sm">
            No contacts or content yet. Book a discovery call or create your first post to get started.
          </p>
        </div>
      )}
    </div>
  );
}
