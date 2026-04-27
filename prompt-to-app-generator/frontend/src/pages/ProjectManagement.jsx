import React, { useState } from 'react';
import { Folder, Download, Trash2, Search, Plus, MoreVertical, Clock, ArrowUpRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const STATUS_STYLES = {
  Active:   { bg: 'rgba(34,211,160,0.1)',  color: '#22d3a0', border: 'rgba(34,211,160,0.2)'  },
  Draft:    { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)'  },
  Archived: { bg: 'rgba(255,255,255,0.05)', color: '#7878a0', border: 'rgba(255,255,255,0.1)' },
};

/* ── Confirm delete dialog ──────────────────────────────── */
function DeleteConfirm({ project, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="rounded-2xl p-6 w-full max-w-sm"
        style={{
          background: 'rgba(13,13,20,0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}
        >
          <Trash2 size={20} style={{ color: '#f87171' }} />
        </div>
        <h3 className="text-base font-bold text-white text-center mb-2">Delete Project?</h3>
        <p className="text-sm text-center mb-6" style={{ color: '#7878a0' }}>
          <strong className="text-white">"{project.name}"</strong> will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
            style={{ justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(248,113,113,0.15)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#f87171',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function ProjectManagement() {
  const { projects, deleteProject } = useAppContext();
  const [query, setQuery] = useState('');
  const [deletingProject, setDeletingProject] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = projects.filter(p =>
    !query || p.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    const name = deletingProject.name;
    try {
      await deleteProject(deletingProject.id);
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeletingProject(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
          <p className="text-sm" style={{ color: '#7878a0' }}>
            Manage, export, and organise your generated applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              width: 220,
            }}
          >
            <Search size={13} style={{ color: '#555568', flexShrink: 0 }} />
            <input
              id="project-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="bg-transparent border-none outline-none text-sm w-full"
              style={{ color: '#e8e8f0' }}
            />
          </div>
          <button
            onClick={() => toast.success('Import dialog opened')}
            className="btn-primary"
            style={{ padding: '9px 16px' }}
          >
            <Plus size={15} /> Import
          </button>
        </div>
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-12 gap-4 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)',
            color: '#3a3a54',
          }}
        >
          <div className="col-span-5 flex items-center gap-1.5">
            <Folder size={12} /> Project Name
          </div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 flex items-center gap-1.5">
            <Clock size={12} /> Last Modified
          </div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          <div>
            {filtered.map((project, i) => {
              const st = STATUS_STYLES[project.status] || STATUS_STYLES.Archived;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center transition-all group"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Name */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(124,110,255,0.1)', border: '1px solid rgba(124,110,255,0.15)' }}
                    >
                      <Folder size={14} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-sm font-medium text-white">{project.name}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span
                      className="badge"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-3 text-sm" style={{ color: '#7878a0' }}>
                    {project.date}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={() => toast.success(`Exporting "${project.name}"…`)}
                      title="Export"
                      className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ padding: '6px', color: '#666680' }}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      title="Delete"
                      className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ padding: '6px', color: '#666680' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = '#666680'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Folder size={22} style={{ color: '#3a3a54' }} />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              {query ? 'No projects match' : 'No projects yet'}
            </h3>
            <p className="text-sm" style={{ color: '#7878a0', maxWidth: 280 }}>
              {query
                ? `No project named "${query}" found. Try a different search.`
                : 'Generate your first app from Prompt Studio to see it here.'
              }
            </p>
          </div>
        )}
      </motion.div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="mt-4 text-xs text-right" style={{ color: '#3a3a54' }}>
          Showing {filtered.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deletingProject && (
          <DeleteConfirm
            project={deletingProject}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
