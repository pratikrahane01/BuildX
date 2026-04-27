import React, { useState } from 'react';
import { Copy, CheckCircle2, FileCode2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

/* ── File icon colour by extension ──────────────────────── */
function fileColor(name) {
  if (name.endsWith('.jsx') || name.endsWith('.tsx')) return '#7c6eff';
  if (name.endsWith('.js') || name.endsWith('.ts'))  return '#fbbf24';
  if (name.endsWith('.css'))                         return '#22d3ee';
  if (name.endsWith('.json'))                        return '#22d3a0';
  return '#888899';
}

/* ── Line numbers ─────────────────────────────────────────── */
function LineNumbers({ count }) {
  return (
    <div
      className="flex-shrink-0 text-right pr-4 py-4 select-none"
      style={{
        color: '#3a3a54',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8125rem',
        lineHeight: '1.75',
        minWidth: 48,
        borderRight: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.15)',
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

export default function CodeEditor({ app }) {
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState(Object.keys(app?.components || {})[0] || '');
  const { updateComponent } = useAppContext();

  const components = app?.components || {};
  const currentCode = components[activeFile] || '';
  const lineCount = currentCode.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0d0d12', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* File tabs */}
      <div
        className="flex items-center overflow-x-auto flex-shrink-0"
        style={{
          background: '#0a0a0f',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          scrollbarWidth: 'none',
        }}
      >
        {Object.keys(components).map((fileName) => (
          <button
            key={fileName}
            onClick={() => setActiveFile(fileName)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs whitespace-nowrap transition-all relative flex-shrink-0"
            style={{
              color: activeFile === fileName ? '#e8e8f0' : '#555568',
              background: activeFile === fileName ? '#0d0d12' : 'transparent',
              borderRight: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <FileCode2 size={12} style={{ color: fileColor(fileName) }} />
            {fileName}
            {activeFile === fileName && (
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: fileColor(fileName) }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: '#0a0a0f',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: '#3a3a54' }}>
          <ChevronRight size={12} />
          <span>src / components /</span>
          <span style={{ color: fileColor(activeFile) }}>{activeFile}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#3a3a54' }}>{lineCount} lines</span>
          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{
              background: copied ? 'rgba(34,211,160,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${copied ? 'rgba(34,211,160,0.25)' : 'rgba(255,255,255,0.07)'}`,
              color: copied ? '#22d3a0' : '#666680',
            }}
          >
            {copied
              ? <><CheckCircle2 size={12} /> Copied!</>
              : <><Copy size={12} /> Copy</>
            }
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex min-h-full">
          <LineNumbers count={lineCount} />
          <textarea
            value={currentCode}
            onChange={e => updateComponent(activeFile, e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 outline-none resize-none text-sm leading-7"
            style={{
              background: 'transparent',
              color: '#c8d0f0',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '0.8125rem',
              tabSize: 2,
              caretColor: 'var(--color-accent)',
              minHeight: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
