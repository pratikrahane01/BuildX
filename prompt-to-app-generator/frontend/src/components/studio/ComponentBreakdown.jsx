import React, { useState } from 'react';
import { Box, Layers, Zap, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ── Recursive tree node ────────────────────────────────── */
function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const hasProps = node.props && Object.keys(node.props).length > 0;

  const depthColors = ['#7c6eff', '#22d3ee', '#22d3a0', '#fbbf24', '#f472b6'];
  const color = depthColors[depth % depthColors.length];

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer group transition-all"
        onClick={() => hasChildren && setExpanded(v => !v)}
        style={{ color: '#c8c8d8' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Expand toggle */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {hasChildren
            ? (expanded
                ? <ChevronDown size={12} style={{ color: '#555568' }} />
                : <ChevronRight size={12} style={{ color: '#555568' }} />)
            : <div className="w-1 h-1 rounded-full" style={{ background: '#3a3a54' }} />
          }
        </div>

        {/* Component icon */}
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Box size={10} style={{ color }} />
        </div>

        {/* Name */}
        <span className="text-sm font-medium" style={{ color: '#d8d8e8' }}>{node.name}</span>

        {/* Props pills */}
        {hasProps && (
          <div className="flex items-center gap-1 ml-1">
            {Object.keys(node.props).slice(0, 3).map(p => (
              <span
                key={p}
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'rgba(124,110,255,0.08)', color: '#7878a0' }}
              >
                {p}
              </span>
            ))}
            {Object.keys(node.props).length > 3 && (
              <span className="text-xs" style={{ color: '#555568' }}>+{Object.keys(node.props).length - 3}</span>
            )}
          </div>
        )}

        {/* Child count */}
        {hasChildren && (
          <span className="ml-auto text-xs" style={{ color: '#3a3a54' }}>
            {node.children.length}
          </span>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
            style={{
              borderLeft: `1px solid rgba(255,255,255,0.05)`,
              marginLeft: 9,
              paddingLeft: 0,
            }}
          >
            {node.children.map((child, i) => (
              <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function ComponentBreakdown({ app }) {
  const totalComponents = Object.keys(app?.components || {}).length;

  const details = [
    { label: 'Framework',        value: 'React 18' },
    { label: 'Styling',          value: 'Tailwind CSS' },
    { label: 'Total Components', value: totalComponents },
    { label: 'State Management', value: 'useState / Context' },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: '#060609' }}>
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,14,0.8)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(124,110,255,0.12)', border: '1px solid rgba(124,110,255,0.2)' }}
          >
            <Layers size={14} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Component Tree</h3>
            <p className="text-xs" style={{ color: '#555568' }}>{totalComponents} components</p>
          </div>
        </div>
        <button
          onClick={() => toast.success('Tree optimized for performance!')}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
        >
          <Zap size={12} style={{ color: '#fbbf24' }} /> Optimize
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Component tree */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: '#444456' }}>
            Hierarchy
          </p>
          {app?.componentTree ? (
            <TreeNode node={app.componentTree} depth={0} />
          ) : (
            <div className="py-8 text-center text-sm" style={{ color: '#444456' }}>
              No component tree data available.
            </div>
          )}
        </div>

        {/* Architecture panel */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: '#444456' }}>
            Architecture
          </p>
          <div className="space-y-0 divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {details.map(d => (
              <div key={d.label} className="flex items-center justify-between py-2.5">
                <span className="text-sm" style={{ color: '#7878a0' }}>{d.label}</span>
                <span
                  className="text-sm font-medium px-2.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#c8c8d8' }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* File list */}
        {app?.components && Object.keys(app.components).length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: '#444456' }}>
              Files
            </p>
            <div className="space-y-1.5">
              {Object.entries(app.components).map(([name, code]) => {
                const lines = (code || '').split('\n').length;
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="text-xs font-mono" style={{ color: '#9090c0' }}>{name}</span>
                    <span className="text-xs" style={{ color: '#444456' }}>{lines} lines</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
