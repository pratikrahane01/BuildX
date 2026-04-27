import React, { useState } from 'react';
import { Send, Sparkles, Code2, Layout, GitMerge, Settings2, Download, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import ChatPanel from '../components/studio/ChatPanel';
import CodeEditor from '../components/studio/CodeEditor';
import LivePreview from '../components/studio/LivePreview';
import ComponentBreakdown from '../components/studio/ComponentBreakdown';

const TABS = [
  { key: 'preview',   label: 'Preview',        icon: Layout },
  { key: 'code',      label: 'Code',            icon: Code2 },
  { key: 'breakdown', label: 'Component Tree',  icon: GitMerge },
];

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
      {/* Animated rings */}
      <div className="relative w-20 h-20 mb-8">
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: 'rgba(124,110,255,0.1)', animationDuration: '2s' }}
        />
        <div
          className="absolute inset-2 rounded-full"
          style={{ background: 'rgba(124,110,255,0.08)', border: '1px solid rgba(124,110,255,0.2)' }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c6eff, #5b4de8)' }}
          >
            <Sparkles size={20} className="text-white" />
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-white mb-3">Ready to generate</h2>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#7878a0' }}>
        Describe your application in the panel on the left and our AI will build it instantly.
      </p>

      {/* Prompt examples */}
      <div className="mt-8 grid grid-cols-1 gap-2 w-full max-w-xs">
        {[
          'SaaS analytics dashboard',
          'E-commerce product page',
          'Team collaboration tool',
        ].map(ex => (
          <div
            key={ex}
            className="px-4 py-2.5 rounded-xl text-sm text-left"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#666680',
            }}
          >
            <span style={{ color: 'var(--color-accent)', marginRight: 8 }}>→</span>
            {ex}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Generating overlay ──────────────────────────────────── */
function GeneratingOverlay({ status }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(12px)' }}
    >
      {/* Animated spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(124,110,255,0.15)',
            borderTopColor: 'var(--color-accent)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <div
          className="absolute inset-3 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(124,110,255,0.1)' }}
        >
          <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
        </div>
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Generating Application</h2>
      <p className="text-sm" style={{ color: '#7878a0' }}>
        {status || 'Writing React components…'}
      </p>
      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-6">
        {['Parsing prompt','Writing components','Styling UI','Finalizing'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--color-accent)',
                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
            {i < 3 && <div className="w-8 h-px" style={{ background: 'rgba(124,110,255,0.2)' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function PromptStudio() {
  const [activeTab, setActiveTab] = useState('preview');
  const { currentApp, isGenerating, generationStatus } = useAppContext();

  const handleExport = () => {
    if (!currentApp) return;
    const blob = new Blob([JSON.stringify(currentApp, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentApp.appName || 'app'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('App exported!');
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Chat Panel ─── */}
      <div className="w-80 flex-shrink-0">
        <ChatPanel />
      </div>

      {/* ── Right: Workspace ─── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#060609' }}>
        {/* Workspace header */}
        <div
          className="h-14 flex items-center justify-between px-4 flex-shrink-0"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(8,8,14,0.8)',
          }}
        >
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: activeTab === tab.key ? '#e8e8f0' : '#555568',
                  background: activeTab === tab.key ? 'rgba(124,110,255,0.1)' : 'transparent',
                }}
              >
                <tab.icon size={14} style={{ color: activeTab === tab.key ? 'var(--color-accent)' : undefined }} />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'rgba(124,110,255,0.08)',
                      border: '1px solid rgba(124,110,255,0.2)',
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {currentApp && (
              <button
                id="export-app-btn"
                onClick={handleExport}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              >
                <Download size={13} /> Export
              </button>
            )}
            <button
              onClick={() => toast('Studio settings are current', { icon: '⚙️' })}
              className="btn-ghost"
              style={{ padding: '7px', color: '#555568' }}
            >
              <Settings2 size={15} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative">
          {!currentApp && !isGenerating ? (
            <EmptyState />
          ) : isGenerating ? (
            <GeneratingOverlay status={generationStatus} />
          ) : (
            <div className="h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  {activeTab === 'preview'   && <LivePreview app={currentApp} />}
                  {activeTab === 'code'      && <CodeEditor app={currentApp} />}
                  {activeTab === 'breakdown' && <ComponentBreakdown app={currentApp} />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
