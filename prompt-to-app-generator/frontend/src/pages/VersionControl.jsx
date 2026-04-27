import React, { useState, useEffect } from 'react';
import { GitCommit, GitBranch, Clock, Plus, RefreshCw, ChevronRight, User, CornerDownRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../services/api';

/* ── Commit card ────────────────────────────────────────── */
function CommitCard({ commit, onRevert, onView, isLast, delay }) {
  const [hovered, setHovered] = useState(false);
  const [reverting, setReverting] = useState(false);

  const handleRevert = async () => {
    setReverting(true);
    await onRevert(commit.id);
    setReverting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      className="relative flex gap-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all"
          style={{
            background: hovered ? 'rgba(124,110,255,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${hovered ? 'rgba(124,110,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: hovered ? '0 0 0 4px rgba(124,110,255,0.08)' : 'none',
          }}
        >
          <GitCommit size={14} style={{ color: hovered ? 'var(--color-accent)' : '#555568' }} />
        </div>
        {!isLast && (
          <div
            className="flex-1 w-px mt-1"
            style={{
              background: 'linear-gradient(to bottom, rgba(124,110,255,0.2) 0%, rgba(255,255,255,0.04) 100%)',
              minHeight: 32,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 pb-6 rounded-xl p-4 transition-all"
        style={{
          background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
          marginBottom: isLast ? 0 : 0,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{commit.message}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: '#555568' }}>
              <span
                className="px-2 py-0.5 rounded font-mono"
                style={{ background: 'rgba(124,110,255,0.1)', color: '#a090ff', border: '1px solid rgba(124,110,255,0.2)' }}
              >
                {commit.id}
              </span>
              <span className="flex items-center gap-1">
                <User size={10} /> {commit.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} /> {commit.time}
              </span>
            </div>
          </div>

          {/* Actions */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <button
                  onClick={() => onView(commit.id)}
                  className="btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                >
                  View
                </button>
                <button
                  onClick={handleRevert}
                  disabled={reverting}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium"
                  style={{
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    color: '#f87171',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                >
                  {reverting
                    ? <><Loader2 size={10} className="animate-spin" /> Reverting…</>
                    : <><CornerDownRight size={10} /> Revert</>
                  }
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function VersionControl() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVersions = async () => {
    try {
      const data = await api.getVersions();
      setHistory(data);
    } catch {
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVersions(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVersions();
    toast.success('Version history refreshed');
  };

  const handleCreateBranch = async () => {
    try {
      await api.createBranch('new-feature');
      toast.success('Branch created!');
    } catch {
      toast.error('Failed to create branch');
    }
  };

  const handleRevert = async (commitId) => {
    const t = toast.loading(`Reverting to ${commitId}…`);
    try {
      await api.revertCommit(commitId);
      toast.success(`Reverted to ${commitId}`, { id: t });
      fetchVersions();
    } catch {
      toast.error('Failed to revert', { id: t });
    }
  };

  const handleView = (commitId) => {
    toast(`Viewing code for ${commitId}`, { icon: '🔍' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3" style={{ color: '#7878a0' }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading version history…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Version Control</h1>
          <p className="text-sm" style={{ color: '#7878a0' }}>
            Track changes and revert to previous generations of your app.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary"
            style={{ padding: '9px 14px' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            id="create-branch-btn"
            onClick={handleCreateBranch}
            className="btn-primary"
            style={{ padding: '9px 16px' }}
          >
            <GitBranch size={14} /> New Branch
          </button>
        </div>
      </motion.div>

      {/* Branch pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-8 p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: 'rgba(34,211,160,0.1)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.2)' }}
        >
          <GitBranch size={13} /> main
        </div>
        <ChevronRight size={14} style={{ color: '#3a3a54' }} />
        <span className="text-sm font-medium" style={{ color: '#7878a0' }}>
          {history.length} commit{history.length !== 1 ? 's' : ''}
        </span>
        <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: '#3a3a54' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22d3a0' }} />
          Up to date
        </div>
      </motion.div>

      {/* Timeline */}
      {history.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-0"
        >
          {history.map((commit, idx) => (
            <CommitCard
              key={commit.id}
              commit={commit}
              onRevert={handleRevert}
              onView={handleView}
              isLast={idx === history.length - 1}
              delay={idx * 0.06}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <GitCommit size={22} style={{ color: '#3a3a54' }} />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No commits yet</h3>
          <p className="text-sm" style={{ color: '#7878a0' }}>
            Generate an app to start tracking version history.
          </p>
        </div>
      )}
    </div>
  );
}
