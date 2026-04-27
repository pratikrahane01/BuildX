import React, { useState, useEffect } from 'react';
import { LayoutTemplate, ShoppingCart, Users, CheckSquare, Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const ICONS = { ShoppingCart, LayoutTemplate, Users, CheckSquare };

/* ── Template card ──────────────────────────────────────── */
function TemplateCard({ template, onUse, delay }) {
  const Icon = ICONS[template.icon] || LayoutTemplate;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card relative overflow-hidden group cursor-pointer flex flex-col"
      style={{
        borderColor: hovered ? 'rgba(124,110,255,0.3)' : undefined,
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,110,255,0.15)' : undefined,
        transition: 'all 0.25s ease',
      }}
    >
      {/* Hero gradient */}
      <div
        className={`h-36 flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${template.color}`}
        style={{ transition: 'all 0.3s ease' }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <motion.div
          animate={{ y: hovered ? -4 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Icon size={26} className="text-white" />
          </div>
        </motion.div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{ background: hovered ? 'rgba(0,0,0,0.3)' : 'transparent' }}
        >
          {hovered && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="badge"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              <Sparkles size={11} /> Use template
            </motion.div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-white mb-1.5">{template.name}</h3>
        <p className="text-xs leading-relaxed flex-1 mb-5" style={{ color: '#7878a0' }}>{template.desc}</p>

        <button
          id={`use-template-${template.id}`}
          onClick={() => onUse(template)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: hovered
              ? 'linear-gradient(135deg, #7c6eff, #5b4de8)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hovered ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
            color: hovered ? '#fff' : '#888899',
            boxShadow: hovered ? '0 4px 16px rgba(124,110,255,0.3)' : 'none',
          }}
        >
          <Sparkles size={13} /> Use Template
          {hovered && <ArrowRight size={13} />}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Skeleton loader ────────────────────────────────────── */
function TemplateSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-36 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-5/6 rounded skeleton" />
        <div className="h-9 rounded-xl skeleton mt-4" />
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getTemplates();
        setTemplates(data);
      } catch {
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUseTemplate = (template) => {
    toast.success(`"${template.name}" selected!`);
    navigate('/app/studio', { state: { initialPrompt: template.prompt } });
  };

  const filtered = templates.filter(t =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.desc?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Starter Templates</h1>
          <p className="text-sm" style={{ color: '#7878a0' }}>
            Kickstart your generation with pre-optimized prompts and structures.
          </p>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            width: 240,
          }}
        >
          <Search size={14} style={{ color: '#555568', flexShrink: 0 }} />
          <input
            id="template-search"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="bg-transparent border-none outline-none text-sm w-full"
            style={{ color: '#e8e8f0' }}
          />
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <TemplateSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t, i) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={handleUseTemplate}
              delay={i * 0.07}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <LayoutTemplate size={32} style={{ color: '#3a3a54', marginBottom: 16 }} />
          <p className="text-base font-semibold text-white mb-2">No templates found</p>
          <p className="text-sm" style={{ color: '#7878a0' }}>
            Try a different search term or{' '}
            <button onClick={() => setQuery('')} className="underline" style={{ color: 'var(--color-accent)' }}>
              clear the filter
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
}
