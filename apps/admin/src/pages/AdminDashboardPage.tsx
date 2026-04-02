import { useState } from 'react';
import {
  Users,
  Globe,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAdminDashboard, useAdminDashboardCharts, useAdminRecentActivity } from '../hooks/useAdmin';
import type { RecentActivityItem, ChartDataPoint } from '../types';

type Period = 'today' | '7days' | '30days' | 'custom';

function toBackendPeriod(p: Period): 'week' | 'month' | 'year' {
  if (p === '30days') return 'month';
  if (p === 'custom') return 'year';
  return 'week';
}

function periodLabel(p: Period): string {
  if (p === 'today') return 'Today';
  if (p === '7days') return 'Last 7 days';
  if (p === '30days') return 'Last 30 days';
  return 'All time';
}

function buildSvgPath(points: ChartDataPoint[]): { path: string; dots: { cx: number; cy: number }[] } {
  if (!points.length) return { path: '', dots: [] };
  const counts = points.map((p) => Number(p.count));
  const max = Math.max(...counts, 1);
  const xs = points.map((_, i) => (i / (points.length - 1 || 1)) * 400);
  const ys = counts.map((c) => 190 - (c / max) * 170);
  const d = xs
    .map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(' ');
  const area = d + ` L${xs[xs.length - 1].toFixed(1)},200 L0,200 Z`;
  return {
    path: area,
    dots: xs.map((cx, i) => ({ cx, cy: ys[i] })),
  };
}

function shortDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function descriptionFor(item: RecentActivityItem): string {
  const d = item.data as Record<string, string>;
  if (item.type === 'user_registered') return `New user registered: ${d.displayName ?? d.email ?? 'Unknown'}`;
  if (item.type === 'post_created') return `New post created: ${d.title ?? 'Untitled'}`;
  if (item.type === 'content_flagged') return 'Content flagged for review';
  return item.type;
}

export default function AdminDashboardPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('today');
  const { data: stats } = useAdminDashboard();
  const { data: chartData } = useAdminDashboardCharts(toBackendPeriod(activePeriod));
  const { data: recentActivity } = useAdminRecentActivity(10);

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: '7days', label: '7 Days' },
    { key: '30days', label: '30 Days' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="p-6">
      {/* Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-[22px] font-bold text-[#F9FAFB]">Dashboard</h1>
        <div
          className="flex items-center rounded-[10px] p-1"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePeriod(p.key)}
              className={`px-4 py-2 text-xs font-medium rounded-[8px] transition cursor-pointer ${
                activePeriod === p.key
                  ? 'text-white'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
              }`}
              style={
                activePeriod === p.key
                  ? { background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }
                  : {}
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Total Users */}
        <div
          className="rounded-[12px] p-5 transition hover:border-[rgba(237,28,36,0.2)]"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <Users className="w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
            </div>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
            >
              <TrendingUp className="w-3 h-3" strokeWidth={1.5} /> 12%
            </span>
          </div>
          <p className="text-[28px] font-bold text-[#F9FAFB] leading-tight">{stats?.users?.total ?? '—'}</p>
          <p className="text-sm text-[#6B7280] mt-1">Total Users</p>
        </div>

        {/* Total Communities */}
        <div
          className="rounded-[12px] p-5 transition"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(20,184,166,0.15)' }}
            >
              <Globe className="w-5 h-5 text-[#14B8A6]" strokeWidth={1.5} />
            </div>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
            >
              <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
            </span>
          </div>
          <p className="text-[28px] font-bold text-[#F9FAFB] leading-tight">{stats?.communities?.total ?? '—'}</p>
          <p className="text-sm text-[#6B7280] mt-1">Total Communities</p>
        </div>

        {/* Total Posts */}
        <div
          className="rounded-[12px] p-5 transition"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.15)' }}
            >
              <FileText className="w-5 h-5 text-[#A855F7]" strokeWidth={1.5} />
            </div>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
            >
              <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
            </span>
          </div>
          <p className="text-[28px] font-bold text-[#F9FAFB] leading-tight">{stats?.content?.posts ?? '—'}</p>
          <p className="text-sm text-[#6B7280] mt-1">Total Posts</p>
        </div>

        {/* Active Today */}
        <div
          className="rounded-[12px] p-5 transition"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(237,28,36,0.15)' }}
            >
              <Activity className="w-5 h-5 text-[#ED1C24]" strokeWidth={1.5} />
            </div>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
            >
              <TrendingDown className="w-3 h-3" strokeWidth={1.5} />
            </span>
          </div>
          <p className="text-[28px] font-bold text-[#F9FAFB] leading-tight">{stats?.users?.newToday ?? '—'}</p>
          <p className="text-sm text-[#6B7280] mt-1">Active Today</p>
        </div>
      </section>

      {/* Charts Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* User Registrations Chart */}
        <div
          className="rounded-[12px] p-5"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-[#F9FAFB]">User Registrations</h3>
            <span className="text-xs text-[#6B7280]">{periodLabel(activePeriod)}</span>
          </div>
          {chartData?.userGrowth?.length ? (() => {
            const { path, dots } = buildSvgPath(chartData.userGrowth);
            const avg = (chartData.userGrowth.reduce((s, p) => s + Number(p.count), 0) / chartData.userGrowth.length).toFixed(1);
            return (
              <>
                <div className="relative h-[200px]">
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(237,28,36,0.3)" />
                        <stop offset="100%" stopColor="rgba(237,28,36,0)" />
                      </linearGradient>
                    </defs>
                    <path d={path} fill="url(#lineGrad)" />
                    <polyline
                      points={dots.map((d) => `${d.cx.toFixed(1)},${d.cy.toFixed(1)}`).join(' ')}
                      fill="none"
                      stroke="#ED1C24"
                      strokeWidth="2"
                    />
                    {dots.map((d, i) => (
                      <circle key={i} cx={d.cx} cy={d.cy} r="3" fill="#ED1C24" />
                    ))}
                  </svg>
                  <div className="absolute bottom-[-24px] left-0 right-0 flex justify-between text-[10px] text-[#6B7280]">
                    {chartData.userGrowth.map((p) => (
                      <span key={p.date}>{shortDateLabel(p.date)}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-4 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ED1C24]" />
                    New users
                  </span>
                  <span>Avg: {avg}/day</span>
                </div>
              </>
            );
          })() : (
            <div className="h-[200px] flex items-center justify-center text-[#6B7280] text-sm">
              {chartData ? 'No data' : 'Loading…'}
            </div>
          )}
        </div>

        {/* Daily Posts Chart */}
        <div
          className="rounded-[12px] p-5"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-[#F9FAFB]">Daily Posts</h3>
            <span className="text-xs text-[#6B7280]">{periodLabel(activePeriod)}</span>
          </div>
          {chartData?.postActivity?.length ? (() => {
            const counts = chartData.postActivity.map((p) => Number(p.count));
            const max = Math.max(...counts, 1);
            const avg = (counts.reduce((s, c) => s + c, 0) / counts.length).toFixed(1);
            return (
              <>
                <div className="relative h-[200px] flex items-end gap-3 px-2">
                  {chartData.postActivity.map((p) => (
                    <div key={p.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-[4px]"
                        style={{
                          height: `${(Number(p.count) / max) * 100}%`,
                          background: 'linear-gradient(180deg, #14B8A6, rgba(20,184,166,0.3))',
                        }}
                      />
                      <span className="text-[10px] text-[#6B7280]">{shortDateLabel(p.date)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                    Posts
                  </span>
                  <span>Avg: {avg}/day</span>
                </div>
              </>
            );
          })() : (
            <div className="h-[200px] flex items-center justify-center text-[#6B7280] text-sm">
              {chartData ? 'No data' : 'Loading…'}
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div
          className="lg:col-span-3 rounded-[12px] p-5"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-base font-semibold text-[#F9FAFB] mb-4">Recent Activity</h3>
          {recentActivity && recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.map((item, idx) => (
                <li key={`${item.timestamp}-${idx}`} className="flex items-center gap-3 text-sm" style={{ color: '#9CA3AF' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ED1C24' }} />
                  <span className="flex-1">{descriptionFor(item)}</span>
                  <span className="text-xs text-[#6B7280]">{new Date(item.timestamp).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-[#6B7280]">
              <Activity className="w-8 h-8 mb-2 opacity-40" strokeWidth={1.5} />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
