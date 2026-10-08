'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/api/dashboard';
import { getProjects } from '@/lib/api/projects';
import { getTasks } from '@/lib/api/tasks';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Project, Task } from '@/types';

const statusText = (status: string) => status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
const dateLabel = (date: string | null) => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date';

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, p, t] = await Promise.all([getDashboardMetrics(), getProjects(), getTasks()]);
      if (!m.data) throw new Error('Dashboard data was unavailable.');
      setMetrics(m.data);
      setProjects(p.data?.projects ?? []);
      setTasks(t.data?.tasks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load your workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const completion = metrics?.totalTasks ? Math.round(metrics.completedTasks / metrics.totalTasks * 100) : 0;
  const openTasks = tasks.filter(t => t.status !== 'COMPLETED').sort((a,b) =>
    (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity));
  const activeProjects = projects.filter(p => p.status !== 'COMPLETED');
  const stats = metrics ? [
    { label: 'Total projects', value: metrics.totalProjects, accent: 'bg-violet-400' },
    { label: 'In progress', value: metrics.projectsInProgress, accent: 'bg-sky-400' },
    { label: 'Open tasks', value: metrics.pendingTasks, accent: 'bg-amber-400' },
    { label: 'Completed tasks', value: metrics.completedTasks, accent: 'bg-emerald-400' },
  ] : [];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.24em] text-primary">Workspace / Overview</p>
            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Good to see you, <span className="nex-gradient-text">{user?.fullName?.split(' ')[0] || 'there'}</span></h1>
            <p className="mt-2 text-sm text-text-secondary">Everything you need to move your work forward.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/tasks/new" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-primary/10">+ New task</Link>
            <Link href="/projects/new" className="nex-gradient rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:opacity-90">+ New project</Link>
          </div>
        </div>

        {loading ? <div className="nex-glass animate-pulse rounded-2xl p-10 text-text-secondary">Loading your workspace…</div> :
        error ? <div role="alert" className="nex-glass rounded-2xl p-6"><h2 className="font-semibold text-text">Unable to load dashboard</h2><p className="mt-2 text-sm text-text-secondary">{error}</p><button onClick={() => void load()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Try again</button></div> :
        metrics && <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(s => <div key={s.label} className="nex-glass rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary"><span className={`h-2 w-2 rounded-full ${s.accent}`} />{s.label}</div>
              <div className="mt-3 text-3xl font-bold tracking-tight text-text">{s.value}</div>
            </div>)}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <section className="nex-glass rounded-2xl p-5 xl:col-span-8">
              <div className="mb-5 flex items-center justify-between">
                <div><h2 className="font-semibold text-text">Project workspace</h2><p className="mt-1 text-xs text-text-secondary">Your active projects and their current status</p></div>
                <Link href="/projects" className="text-xs font-semibold text-primary hover:underline">All projects →</Link>
              </div>
              {activeProjects.length ? <div className="space-y-3">
                {activeProjects.slice(0,6).map((p,i) => <Link key={p.id} href={`/projects/${p.id}`} className="group flex items-center gap-4 rounded-xl border border-border bg-background/40 p-3 transition hover:border-primary/50">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${['bg-violet-500','bg-sky-500','bg-indigo-500','bg-teal-500'][i%4]}`}>{p.name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text group-hover:text-primary">{p.name}</p><p className="mt-1 truncate text-xs text-text-secondary">{p.description || 'No description yet'}</p></div>
                  <div className="hidden text-right sm:block"><span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">{statusText(p.status)}</span><p className="mt-2 text-[11px] text-text-secondary">{p.endDate ? `Due ${dateLabel(p.endDate)}` : 'No deadline'}</p></div>
                  <span className="text-text-secondary">→</span>
                </Link>)}
              </div> : <div className="rounded-xl border border-dashed border-border p-8 text-center"><p className="text-sm text-text-secondary">No active projects yet.</p><Link href="/projects/new" className="mt-3 inline-block text-sm font-semibold text-primary">Create your first project →</Link></div>}
            </section>

            <section className="nex-glass rounded-2xl p-5 xl:col-span-4">
              <div className="mb-6"><h2 className="font-semibold text-text">Task progress</h2><p className="mt-1 text-xs text-text-secondary">Your overall completion rate</p></div>
              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full p-4" style={{background:`conic-gradient(var(--primary) ${completion}%, var(--border) ${completion}% 100%)`}}>
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-background"><span className="text-4xl font-bold text-text">{completion}%</span><span className="mt-1 text-xs text-text-secondary">completed</span></div>
              </div>
              <div className="mt-6 flex justify-between border-t border-border pt-4 text-sm"><span className="text-text-secondary">Total tasks</span><strong className="text-text">{metrics.totalTasks}</strong></div>
              <div className="mt-3 flex justify-between text-sm"><span className="text-text-secondary">Completed</span><strong className="text-text">{metrics.completedTasks}</strong></div>
              <div className="mt-3 flex justify-between text-sm"><span className="text-text-secondary">Pending</span><strong className="text-text">{metrics.pendingTasks}</strong></div>
            </section>

            <section className="nex-glass rounded-2xl p-5 xl:col-span-8">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-text">Upcoming tasks</h2><p className="mt-1 text-xs text-text-secondary">Stay focused on what needs attention</p></div><Link href="/tasks" className="text-xs font-semibold text-primary hover:underline">View tasks →</Link></div>
              {openTasks.length ? <div className="divide-y divide-border">{openTasks.slice(0,6).map(t => <Link href={`/tasks/${t.id}`} key={t.id} className="flex items-center gap-3 py-3 hover:text-primary"><span className="h-4 w-4 shrink-0 rounded border-2 border-primary/50"/><span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{t.name}</span><span className={`hidden rounded-md px-2 py-1 text-[11px] font-medium sm:block ${t.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary'}`}>{statusText(t.priority)}</span><span className="whitespace-nowrap text-xs text-text-secondary">{dateLabel(t.dueDate)}</span></Link>)}</div> : <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">No open tasks. <Link href="/tasks/new" className="font-semibold text-primary">Add a task →</Link></div>}
            </section>

            <section className="nex-glass rounded-2xl p-5 xl:col-span-4">
              <h2 className="font-semibold text-text">Quick access</h2><p className="mt-1 text-xs text-text-secondary">Jump back into your workflow</p>
              <div className="mt-5 space-y-2">
                {[{label:'Manage projects',href:'/projects',icon:'▦'},{label:'Task board',href:'/tasks',icon:'☑'},{label:'My account',href:'/account',icon:'◉'}].map(item => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-4 py-3 text-sm font-medium text-text transition hover:border-primary/50 hover:bg-primary/10"><span className="text-lg text-primary">{item.icon}</span><span className="flex-1">{item.label}</span><span className="text-text-secondary">↗</span></Link>)}
              </div>
            </section>
          </div>
        </>}
      </div>
    </AppShell>
  );
}
