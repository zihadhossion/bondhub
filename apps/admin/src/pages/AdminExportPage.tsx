import { Users, Globe, FileText, MessageSquare, Flag, Download, Database } from 'lucide-react';
import { adminService } from '../services/api/admin.service';
import { useAdminDashboard } from '../hooks/useAdmin';

interface ExportCardConfig {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  recordsBg: string;
  recordsColor: string;
  buttonLabel: string;
  recordCount?: number;
}

const EXPORT_CARDS: ExportCardConfig[] = [
  {
    id: 'users',
    title: 'User Data',
    description: 'Export user accounts with profile information',
    iconBg: 'rgba(20,184,166,0.15)',
    iconColor: '#2DD4BF',
    Icon: Users,
    recordsBg: 'rgba(20,184,166,0.1)',
    recordsColor: '#2DD4BF',
    buttonLabel: 'Download Users',
  },
  {
    id: 'communities',
    title: 'Community Data',
    description: 'Export community info and metadata',
    iconBg: 'rgba(59,130,246,0.15)',
    iconColor: '#60A5FA',
    Icon: Globe,
    recordsBg: 'rgba(59,130,246,0.1)',
    recordsColor: '#60A5FA',
    buttonLabel: 'Download Communities',
  },
  {
    id: 'posts',
    title: 'Post Data',
    description: 'Export all posts with author and community info',
    iconBg: 'rgba(168,85,247,0.15)',
    iconColor: '#C084FC',
    Icon: FileText,
    recordsBg: 'rgba(168,85,247,0.1)',
    recordsColor: '#C084FC',
    buttonLabel: 'Download Posts',
  },
  {
    id: 'comments',
    title: 'Comment Data',
    description: 'Export all comments with author and post context',
    iconBg: 'rgba(244,114,182,0.15)',
    iconColor: '#F472B6',
    Icon: MessageSquare,
    recordsBg: 'rgba(244,114,182,0.1)',
    recordsColor: '#F472B6',
    buttonLabel: 'Download Comments',
  },
  {
    id: 'flagged',
    title: 'Flagged Content',
    description: 'Export flagged items with moderation history',
    iconBg: 'rgba(239,68,68,0.15)',
    iconColor: '#F87171',
    Icon: Flag,
    recordsBg: 'rgba(239,68,68,0.1)',
    recordsColor: '#F87171',
    buttonLabel: 'Download Flagged',
  },
];

function ExportCard({ config }: { config: ExportCardConfig }) {
  const validIds = ['users', 'communities', 'posts'] as const;
  const isDownloadable = validIds.includes(config.id as typeof validIds[number]);

  const handleDownload = () => {
    if (isDownloadable) {
      window.location.href = adminService.exportCsvUrl(config.id as typeof validIds[number]);
    }
  };

  const { Icon, iconBg, iconColor, recordsBg, recordsColor } = config;

  return (
    <div
      className="rounded-[12px] flex flex-col gap-4 transition hover:border-white/10"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}
    >
      {/* Icon + Title */}
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          <span style={{ color: iconColor }}><Icon className="w-5 h-5" strokeWidth={1.5} /></span>
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-[#F9FAFB]">{config.title}</h2>
          <p className="text-sm mt-0.5 text-[#9CA3AF]">{config.description}</p>
        </div>
      </div>

      {/* Record count badge */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: recordsBg, color: recordsColor }}
        >
          <Database className="w-3 h-3" strokeWidth={1.5} />
          {config.recordCount !== undefined ? `${config.recordCount} total records` : '— total records'}
        </span>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={!isDownloadable}
        className="w-full text-white text-sm font-semibold py-2.5 rounded-[10px] cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
        style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
      >
        <Download className="w-4 h-4" strokeWidth={1.5} />
        {config.buttonLabel}
      </button>
    </div>
  );
}

export default function AdminExportPage() {
  const { data: stats } = useAdminDashboard();

  const cardsWithCounts = EXPORT_CARDS.map(card => ({
    ...card,
    recordCount:
      card.id === 'users' ? stats?.users?.total :
      card.id === 'communities' ? stats?.communities?.total :
      card.id === 'posts' ? stats?.content?.posts :
      undefined,
  }));

  return (
    <div className="p-6 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Data Export</h1>
        <p className="text-sm mt-1 text-[#9CA3AF]">Download platform data in CSV format</p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cardsWithCounts.map((config) => (
          <ExportCard key={config.id} config={config} />
        ))}
      </div>
    </div>
  );
}
