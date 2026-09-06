import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { DashboardGrid, Panel } from '../components/ui/Panel.jsx';
import { Button } from '../components/ui/Button.jsx';

const QUICK_ACTIONS = [
  {
    id: 'ai',
    mode: 'ai',
    icon: 'AI',
    title: 'AI Support',
    description: 'Start or continue an assistant conversation.',
  },
  {
    id: 'group',
    mode: 'team',
    icon: 'TC',
    title: 'Team Chat',
    description: 'Coordinate with your team in real time.',
  },
];

const MODE_ACTION_STYLES = {
  ai: {
    icon: 'bg-[rgb(var(--accent-ai-muted))] text-[rgb(var(--accent-ai))]',
    ring: 'ring-[rgb(var(--accent-ai)/0.15)] hover:ring-[rgb(var(--accent-ai)/0.35)]',
  },
  team: {
    icon: 'bg-[rgb(var(--accent-team-muted))] text-[rgb(var(--accent-team))]',
    ring: 'ring-[rgb(var(--accent-team)/0.15)] hover:ring-[rgb(var(--accent-team)/0.35)]',
  },
  admin: {
    icon: 'bg-surface-muted text-ink',
    ring: 'ring-border-subtle hover:ring-border-strong',
  },
};

function QuickActionCard({ action, onSelect }) {
  const styles = MODE_ACTION_STYLES[action.mode] || MODE_ACTION_STYLES.admin;

  return (
    <button
      type="button"
      onClick={() => onSelect(action.id)}
      className={`flex w-full items-start gap-4 rounded-xl border border-border-subtle bg-surface p-4 text-left motion-safe ring-1 ${styles.ring}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-meta font-semibold ${styles.icon}`}
      >
        {action.icon}
      </span>
      <span className="min-w-0">
        <span className="block text-body font-semibold text-ink">{action.title}</span>
        <span className="mt-1 block text-meta-subtle text-ink-muted">{action.description}</span>
      </span>
    </button>
  );
}

function workspaceEnvironmentLabel() {
  return import.meta.env.PROD ? 'Production' : 'Development';
}

export function DashboardPage({ currentUser, isAdmin, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    aiThreads: 0,
    teamGroups: 0,
    onlineUsers: 0,
    totalUsers: null,
    activeModels: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const requests = [
          api.listChats(),
          api.listGroupChats(),
          api.fetchOnlineUsers().catch(() => []),
        ];

        if (isAdmin) {
          requests.push(
            api.adminListUsers({ page: 1, limit: 1 }),
            api.adminListModels().catch(() => []),
          );
        }

        const results = await Promise.all(requests);
        if (cancelled) return;

        const [chats, groups, online, usersPage, models] = results;
        const onlineCount = Array.isArray(online)
          ? online.length
          : online?.onlineUsers?.length ?? online?.users?.length ?? 0;
        const modelList = Array.isArray(models) ? models : models?.items ?? [];

        setStats({
          aiThreads: chats?.length ?? 0,
          teamGroups: groups?.length ?? 0,
          onlineUsers: onlineCount,
          totalUsers: isAdmin ? usersPage?.total ?? 0 : null,
          activeModels: isAdmin
            ? modelList.filter((model) => model.isActive !== false).length
            : null,
        });
      } catch {
        if (!cancelled) {
          setStats((prev) => ({ ...prev, aiThreads: 0, teamGroups: 0, onlineUsers: 0 }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const greeting = currentUser?.username || 'there';
  const roleLabel = isAdmin ? 'Administrator' : 'Member';

  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-bg">
      <PageHeader
        meta="Overview"
        title={`Welcome back, ${greeting}`}
        subMeta={`${roleLabel} · ${workspaceEnvironmentLabel()}`}
        description="Your workspace at a glance — jump into chat or review activity below."
      />

      <div className="scroll-thin flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-[rgb(var(--accent-ai-muted))] via-surface to-[rgb(var(--accent-team-muted)/0.45)] p-6 md:p-8">
          <p className="text-meta font-medium uppercase tracking-wide text-ink-muted">MeshDesk</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {isAdmin ? 'Run your workspace from one place' : 'Pick up where you left off'}
          </h2>
          <p className="mt-2 max-w-2xl text-body text-ink-muted">
            {isAdmin
              ? 'Monitor people, models, and conversations — then open Admin when you need to change settings.'
              : 'AI Support and Team Chat are one click away. Your recent activity is summarized below.'}
          </p>
        </div>

        <DashboardGrid columns={isAdmin ? 4 : 3} className="mb-6">
          <StatCard
            label="AI threads"
            value={loading ? '—' : stats.aiThreads}
            hint="Personal assistant conversations"
          />
          <StatCard
            label="Team groups"
            value={loading ? '—' : stats.teamGroups}
            hint="Group chats you belong to"
          />
          <StatCard
            label="Online now"
            value={loading ? '—' : stats.onlineUsers}
            hint="Teammates currently active"
          />
          {isAdmin ? (
            <StatCard
              label="Workspace users"
              value={loading ? '—' : stats.totalUsers}
              hint="Registered accounts"
            />
          ) : null}
        </DashboardGrid>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Quick actions" description="Open a workspace area">
            <div className="grid gap-3">
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard key={action.id} action={action} onSelect={onNavigate} />
              ))}
              {isAdmin ? (
                <QuickActionCard
                  action={{
                    id: 'admin',
                    mode: 'admin',
                    icon: 'Ad',
                    title: 'Administration',
                    description: 'Manage users, integrations, and AI models.',
                  }}
                  onSelect={onNavigate}
                />
              ) : null}
            </div>
          </Panel>

          <Panel
            title={isAdmin ? 'Workspace snapshot' : 'Your activity'}
            description={isAdmin ? 'Admin-focused metrics' : 'Summary for your account'}
            actions={
              isAdmin ? (
                <Button size="sm" variant="secondary" onClick={() => onNavigate('admin')}>
                  Open admin
                </Button>
              ) : null
            }
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-surface-muted px-4 py-3">
                <dt className="text-meta text-ink-muted">Signed in as</dt>
                <dd className="mt-1 font-medium text-ink">{currentUser?.email}</dd>
              </div>
              <div className="rounded-lg bg-surface-muted px-4 py-3">
                <dt className="text-meta text-ink-muted">Role</dt>
                <dd className="mt-1 font-medium capitalize text-ink">{currentUser?.role || 'user'}</dd>
              </div>
              {isAdmin ? (
                <>
                  <div className="rounded-lg bg-surface-muted px-4 py-3">
                    <dt className="text-meta text-ink-muted">Active AI models</dt>
                    <dd className="mt-1 font-medium text-ink">
                      {loading ? '—' : stats.activeModels}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-surface-muted px-4 py-3">
                    <dt className="text-meta text-ink-muted">Environment</dt>
                    <dd className="mt-1 font-medium text-ink">{workspaceEnvironmentLabel()}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-surface-muted px-4 py-3">
                    <dt className="text-meta text-ink-muted">AI threads</dt>
                    <dd className="mt-1 font-medium text-ink">{loading ? '—' : stats.aiThreads}</dd>
                  </div>
                  <div className="rounded-lg bg-surface-muted px-4 py-3">
                    <dt className="text-meta text-ink-muted">Team groups</dt>
                    <dd className="mt-1 font-medium text-ink">{loading ? '—' : stats.teamGroups}</dd>
                  </div>
                </>
              )}
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
