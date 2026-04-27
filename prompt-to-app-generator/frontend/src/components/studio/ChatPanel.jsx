import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, LayoutTemplate, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

/* ── Typing indicator ───────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #7c6eff, #5b4de8)' }}
      >
        <Sparkles size={13} className="text-white" />
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
        style={{
          background: 'rgba(124,110,255,0.08)',
          border: '1px solid rgba(124,110,255,0.15)',
        }}
      >
        <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-accent)' }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-accent)' }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-accent)' }} />
      </div>
    </div>
  );
}

/* ── Template selector ──────────────────────────────────── */
function TemplateSelector({ onSelectTemplate }) {
  const { templates } = useAppContext();
  const [open, setOpen] = useState(false);

  if (!templates || templates.length === 0) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs font-medium mb-2 transition-colors w-full"
        style={{ color: '#666680' }}
      >
        <LayoutTemplate size={12} />
        Start from a template
        {open ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-1.5 pb-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => { onSelectTemplate(t.id); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(124,110,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <p className="text-xs font-semibold text-white">{t.appName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#666680' }}>{t.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Message bubble ─────────────────────────────────────── */
function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
        style={{
          background: isUser
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, #7c6eff, #5b4de8)',
          border: isUser ? '1px solid rgba(255,255,255,0.1)' : 'none',
        }}
      >
        {isUser
          ? <User size={13} style={{ color: '#c8c8d8' }} />
          : <Sparkles size={13} className="text-white" />
        }
      </div>

      {/* Bubble */}
      <div
        className={`px-3.5 py-2.5 text-sm leading-relaxed max-w-[82%] ${
          isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'
        }`}
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #7c6eff, #5b4de8)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(124,110,255,0.25)',
              }
            : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#c8c8d8',
              }
        }
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function ChatPanel() {
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || '');
  const [messages, setMessages] = useState([]);
  const [lastPrompt, setLastPrompt] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const {
    generateNewApp, isGenerating, currentApp,
    generationStatus, generationMeta, setGenerationStatus,
  } = useAppContext();

  useEffect(() => {
    if (location.state?.initialPrompt) setPrompt(location.state.initialPrompt);
    setMessages([{
      role: 'assistant',
      content: 'Hi! Describe the app you want to build, or start from a template below. I\'ll generate it instantly.',
    }]);
    setGenerationStatus('');
  }, [location.state]);

  useEffect(() => {
    if (!isGenerating && generationStatus) {
      const statusMessage = generationMeta?.usedFallback
        ? `${generationStatus}${generationMeta.fallbackReason ? ` — ${generationMeta.fallbackReason}` : ''}`
        : generationStatus;
      setMessages(prev => [...prev, { role: 'assistant', content: statusMessage }]);
    }
  }, [isGenerating, generationStatus, generationMeta]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [prompt]);

  const handleGenerate = async (e, options = {}) => {
    let promptToUse = prompt;
    if (e && e.preventDefault) e.preventDefault();
    else if (typeof e === 'string') promptToUse = e;

    const { isRegenerate = false, template = null, style = null } = options;
    if (!template && (!promptToUse || !promptToUse.trim() || isGenerating)) return;

    let userMessage = template ? `Generate from template: ${template}` : promptToUse;
    if (style) userMessage = `${userMessage} in a ${style} style.`;

    if (!isRegenerate) setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setPrompt('');
    setLastPrompt(promptToUse);

    const isIterative = !!currentApp && !isRegenerate;
    await generateNewApp(userMessage, { isIterative, template });
  };

  const handleSelectTemplate = (templateId) => handleGenerate(null, { template: templateId });

  const canSend = prompt.trim().length > 0 && !isGenerating;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'rgba(6,6,10,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c6eff, #5b4de8)' }}
        >
          <Sparkles size={13} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Prompt Studio</h2>
          <p className="text-xs" style={{ color: '#555568' }}>Describe your app to get started</p>
        </div>
        {currentApp && (
          <div className="ml-auto badge badge-green" style={{ fontSize: '0.65rem' }}>
            App ready
          </div>
        )}
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} index={idx} />
        ))}
        {isGenerating && (
          <div className="space-y-2">
            <TypingIndicator />
            {generationStatus && (
              <p className="text-xs pl-10" style={{ color: '#666680' }}>{generationStatus}</p>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <TemplateSelector onSelectTemplate={handleSelectTemplate} />

        {/* Quick action chips */}
        {lastPrompt && !lastPrompt.startsWith('Generate from template:') && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => handleGenerate(lastPrompt, { isRegenerate: true })}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-all font-medium"
              style={{
                background: 'rgba(34,211,160,0.08)',
                border: '1px solid rgba(34,211,160,0.2)',
                color: '#22d3a0',
              }}
            >
              <Sparkles size={10} /> Regenerate
            </button>
            <button
              onClick={() => handleGenerate(lastPrompt, { isRegenerate: true, style: 'minimalist' })}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-all font-medium"
              style={{
                background: 'rgba(124,110,255,0.08)',
                border: '1px solid rgba(124,110,255,0.2)',
                color: '#a090ff',
              }}
            >
              <Wand2 size={10} /> Minimalist
            </button>
          </div>
        )}

        {/* Textarea */}
        <div
          className="relative rounded-xl overflow-hidden transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(124,110,255,0.3)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,110,255,0.08)';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            id="prompt-input"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate(prompt);
              }
            }}
            placeholder="Describe your app… (e.g. 'Build a SaaS analytics dashboard')"
            className="w-full px-4 py-3 pr-12 text-sm resize-none outline-none"
            style={{
              background: 'transparent',
              color: '#e8e8f0',
              minHeight: 72,
              maxHeight: 140,
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
            }}
            disabled={isGenerating}
          />
          <button
            id="send-prompt-btn"
            onClick={() => handleGenerate(prompt)}
            disabled={!canSend}
            className="absolute right-3 bottom-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #7c6eff, #5b4de8)'
                : 'rgba(255,255,255,0.06)',
              boxShadow: canSend ? '0 4px 12px rgba(124,110,255,0.3)' : 'none',
            }}
          >
            {isGenerating
              ? <Loader2 size={14} className="animate-spin text-white" />
              : <Send size={14} style={{ color: canSend ? '#fff' : '#444456' }} />
            }
          </button>
        </div>

        <p className="mt-2 text-center text-xs" style={{ color: '#3a3a50' }}>
          Enter to generate · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
