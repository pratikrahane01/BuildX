import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, TerminalSquare, Clock, Zap, Lightbulb,
  ArrowRight, TrendingUp, Activity, Sparkles,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, iconBg, value, label, badge, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="card p-6 relative overflow-hidden group"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 0%, ${iconColor}10 0%, transparent 60%)` }}
      />

      <div className="flex items-start justify-between mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {badge && (
          <span className="badge badge-green text-xs">
            <TrendingUp size={10} /> {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm" style={{ color: '#7878a0' }}>{label}</p>
    </motion.div>
  );
}

/* ── Project Card ───────────────────────────────────────── */
function ProjectCard({ project, delay }) {
  const statusColors = {
    Active: { bg: 'rgba(34,211,160,0.12)', color: '#22d3a0', border: 'rgba(34,211,160,0.2)' },
    Draft:  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.2)'  },
    default:{ bg: 'rgba(255,255,255,0.05)', color: '#888899', border: 'rgba(255,255,255,0.08)'},
  };
  const st = statusColors[project.status] || statusColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card p-5 group cursor-pointer relative overflow-hidden"
      style={{ '--hover-border': 'rgba(124,110,255,0.3)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,110,255,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'var(--color-accent)' }}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(124,110,255,0.1)', border: '1px solid rgba(124,110,255,0.15)' }}
          >
            <TerminalSquare size={16} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">{project.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5" style={{ color: '#555568' }}>
              <Clock size={11} />
              <span className="text-xs">Updated {project.date}</span>
            </div>
          </div>
        </div>
        <div
          className="badge"
          style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
        >
          {project.status}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 mt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-1 text-xs" style={{ color: '#555568' }}>
          <Activity size={11} />
          <span>React · Tailwind</span>
        </div>
        <ArrowRight
          size={14}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-accent)' }}
        />
      </div>
    </motion.div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function Dashboard() {
  const { projects, loadProjects } = useAppContext();

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const stats = [
    {
      icon: TerminalSquare,
      iconColor: 'var(--color-accent)',
      iconBg: 'rgba(124,110,255,0.12)',
      value: '12',
      label: 'Apps Generated',
      badge: '+3 this week',
    },
    {
      icon: Zap,
      iconColor: 'var(--color-green)',
      iconBg: 'rgba(34,211,160,0.1)',
      value: '142',
      label: 'Components Created',
      badge: '+18 today',
    },
    {
      icon: Lightbulb,
      iconColor: '#fbbf24',
      iconBg: 'rgba(251,191,36,0.1)',
      value: '8.3s',
      label: 'Avg. Generation Time',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-sm" style={{ color: '#7878a0' }}>
            Here's what's happening with your apps today.
          </p>
        </div>
        <Link
          to="/app/studio"
          id="new-app-btn"
          className="btn-primary flex-shrink-0"
          style={{ padding: '10px 20px' }}
        >
          <Plus size={16} />
          New App
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 stagger">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* AI Tip Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5 mb-10 flex items-center gap-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(124,110,255,0.1) 0%, rgba(6,182,212,0.07) 100%)',
          border: '1px solid rgba(124,110,255,0.18)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0% 50%, rgba(124,110,255,0.15) 0%, transparent 60%)' }}
        />
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(124,110,255,0.15)', border: '1px solid rgba(124,110,255,0.25)' }}
        >
          <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-0.5">AI Insight</p>
          <p className="text-sm" style={{ color: '#9090b0' }}>
            Try prompting for <strong className="text-white">"Authentication flows"</strong> to accelerate your next project.
          </p>
        </div>
        <Link
          to="/app/studio"
          className="btn-secondary flex-shrink-0 text-xs"
          style={{ padding: '7px 14px' }}
        >
          Try it <ArrowRight size={12} />
        </Link>
      </motion.div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Recent Projects</h2>
          <Link
            to="/app/projects"
            className="text-sm font-medium flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} delay={0.35 + i * 0.06} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,110,255,0.08)', border: '1px solid rgba(124,110,255,0.15)' }}
            >
              <TerminalSquare size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-sm mb-6" style={{ color: '#7878a0', maxWidth: 320 }}>
              Generate your first app using the Prompt Studio and it will appear here.
            </p>
            <Link to="/app/studio" className="btn-primary" style={{ padding: '10px 20px' }}>
              <Sparkles size={15} /> Start Generating
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
