import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Tablet, RotateCw, Loader2, Maximize2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Device presets ─────────────────────────────────────── */
const DEVICES = [
  { key: 'desktop', label: 'Desktop', icon: Monitor,   width: null,  height: null },
  { key: 'tablet',  label: 'Tablet',  icon: Tablet,    width: 768,   height: 1024 },
  { key: 'mobile',  label: 'Mobile',  icon: Smartphone,width: 375,   height: 812  },
];

export default function LivePreview({ app }) {
  const [device, setDevice]           = useState('desktop');
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const iframeRef = useRef(null);

  /* ── Helpers ──────────────────────────────────────────── */
  const cleanCode = (code) => {
    if (!code) return '';
    const trimmed = code.trim();
    if (trimmed.startsWith('"') || trimmed.startsWith('{')) {
      try { const p = JSON.parse(trimmed); if (typeof p === 'string') code = p; } catch (_) {}
    }
    code = code.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
    code = code.replace(/^[ \t]*import\s[\s\S]*?from\s['"][^'"]+['"]\s*;?\s*$/gm, '');
    code = code.replace(/^[ \t]*import\s['"][^'"]+['"]\s*;?\s*$/gm, '');
    code = code.replace(/export\s+default\s+function\s+/g, 'function ');
    code = code.replace(/export\s+function\s+/g, 'function ');
    code = code.replace(/export\s+const\s+/g, 'const ');
    code = code.replace(/^[ \t]*export\s+default\s+[A-Za-z0-9_]+\s*;?\s*$/gm, '');
    code = code.replace(/^[ \t]*export\s*\{[^}]*\}\s*;?\s*$/gm, '');
    return code;
  };

  const compileApp = () => {
    if (!app?.components) return;
    setIsCompiling(true);
    try {
      const components  = Object.keys(app.components);
      const appCompName = components.find(c => c === 'App.jsx' || c === 'App.js') || components[0];
      const otherComps  = components.filter(c => c !== appCompName);
      const rawAppCode  = app.components[appCompName] || '';

      let rootCompName = null;
      const matchA = rawAppCode.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      if (matchA) rootCompName = matchA[1];
      if (!rootCompName) {
        const matchB = rawAppCode.match(/export\s+default\s+([A-Za-z0-9_]+)\s*;/);
        if (matchB) rootCompName = matchB[1];
      }
      if (!rootCompName) {
        const matchC = rawAppCode.match(/const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>/);
        if (matchC) rootCompName = matchC[1];
      }
      if (!rootCompName) {
        const matchD = rawAppCode.match(/function\s+([A-Za-z0-9_]+)\s*\(/);
        if (matchD) rootCompName = matchD[1];
      }
      if (!rootCompName) rootCompName = appCompName.replace(/\.[^.]+$/, '');

      const importedIcons = new Set();
      const jsxComponentRefs = new Set();
      const declaredComponentNames = new Set();

      Object.values(app.components).forEach(code => {
        const src = code || '';
        [...src.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"](?:lucide-react|react-icons[^'"]*)['\"]/g)].forEach(m =>
          m[1].split(',').map(i => i.trim().split(/\s+as\s+/).pop()).filter(Boolean).forEach(icon => importedIcons.add(icon))
        );
        [...src.matchAll(/<\s*([A-Z][A-Za-z0-9_]*)\b/g)].forEach(m => jsxComponentRefs.add(m[1]));
        [...src.matchAll(/\bfunction\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].forEach(m => declaredComponentNames.add(m[1]));
        [...src.matchAll(/\bconst\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>/g)].forEach(m => declaredComponentNames.add(m[1]));
        [...src.matchAll(/\bclass\s+([A-Z][A-Za-z0-9_]*)\s+extends\s+React\.Component/g)].forEach(m => declaredComponentNames.add(m[1]));
      });

      declaredComponentNames.add(rootCompName);
      const reactBuiltins = new Set(['Fragment', 'StrictMode', 'Suspense', 'Profiler']);
      jsxComponentRefs.forEach(name => {
        if (!declaredComponentNames.has(name) && !reactBuiltins.has(name)) importedIcons.add(name);
      });

      let combinedCode = '';
      otherComps.forEach(comp => { combinedCode += `\n// === ${comp} ===\n` + cleanCode(app.components[comp]) + '\n'; });
      combinedCode += `\n// === ${appCompName} ===\n` + cleanCode(rawAppCode) + '\n';

      const defaultIconNames = [
        'Search','Menu','X','Plus','Minus','Check','CheckCircle','User','Users',
        'Bell','Settings','Home','ChevronDown','ChevronUp','ChevronLeft','ChevronRight',
        'ArrowRight','ArrowLeft','Calendar','Clock','Mail','Phone','MapPin',
      ];
      defaultIconNames.forEach(icon => {
        if (!declaredComponentNames.has(icon) && icon !== rootCompName) importedIcons.add(icon);
      });

      let iconMocks = '';
      if (importedIcons.size > 0) {
        iconMocks = '// === Icon Mocks ===\n';
        importedIcons.forEach(icon => {
          iconMocks += `var ${icon} = function(props) {
  return React.createElement('svg', {
    width: props.size || props.width || 24,
    height: props.size || props.height || 24,
    viewBox: "0 0 24 24", fill: "none",
    stroke: props.color || "currentColor",
    strokeWidth: props.strokeWidth || 2,
    className: props.className || ""
  }, React.createElement('rect', { x:3, y:3, width:18, height:18, rx:2 }));
};\n`;
        });
      }

      const mountCode = `
// === Mount ===
(function() {
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(${rootCompName}));
})();
`;

      const fullSource = `
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var useCallback = React.useCallback;
var useMemo = React.useMemo;
var useContext = React.useContext;
var useReducer = React.useReducer;
var useLayoutEffect = React.useLayoutEffect;
var createContext = React.createContext;

${iconMocks}
${combinedCode}
${mountCode}
`.trim();

      const escapedSource = fullSource.replace(/<\/script/gi, '<\\/script');

      const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin="anonymous"><\/script>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #error-overlay { display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:#050508; color:#f87171; padding:28px; font-family:monospace; font-size:13px; white-space:pre-wrap; overflow:auto; z-index:9999; border-left:3px solid #f87171; }
    #error-overlay::before { content:"⚠ Runtime Error"; display:block; font-size:16px; font-weight:700; margin-bottom:16px; color:#fca5a5; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-overlay"></div>
  <script>
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a');
      if (a && a.hasAttribute('href') && !a.getAttribute('href').startsWith('#')) {
        e.preventDefault();
      }
    }, true);
    document.addEventListener('submit', function(e) { e.preventDefault(); }, true);
    window.addEventListener('error', function(e) {
      var overlay = document.getElementById('error-overlay');
      overlay.style.display = 'block';
      overlay.textContent = e.message + '\\n\\nFile: ' + (e.filename || '') + '\\nLine: ' + (e.lineno || '');
    });
  <\/script>
  <script type="text/babel" data-presets="react">
${escapedSource}
  <\/script>
</body>
</html>`;

      setIframeSrcDoc(htmlTemplate);
    } catch (err) {
      console.error('LivePreview compile error:', err);
    } finally {
      setTimeout(() => setIsCompiling(false), 600);
    }
  };

  useEffect(() => { if (app) compileApp(); }, [app]);

  const handleRefresh = () => {
    if (iframeSrcDoc) {
      const doc = iframeSrcDoc;
      setIframeSrcDoc('');
      setTimeout(() => setIframeSrcDoc(doc), 80);
    }
  };

  const activeDevice = DEVICES.find(d => d.key === device);

  return (
    <div className="h-full flex flex-col" style={{ background: '#060609' }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,14,0.8)' }}
      >
        {/* Device switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {DEVICES.map(d => (
            <button
              key={d.key}
              id={`device-${d.key}`}
              onClick={() => setDevice(d.key)}
              title={d.label}
              className="relative p-2 rounded-lg transition-all"
              style={{
                background: device === d.key ? 'rgba(124,110,255,0.15)' : 'transparent',
                color: device === d.key ? 'var(--color-accent)' : '#555568',
              }}
            >
              <d.icon size={15} />
              {device === d.key && (
                <motion.div
                  layoutId="device-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'rgba(124,110,255,0.12)',
                    border: '1px solid rgba(124,110,255,0.25)',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Center: app name */}
        <div className="flex items-center gap-2">
          {isCompiling && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#666680' }}>
              <Loader2 size={11} className="animate-spin" /> Compiling…
            </span>
          )}
          {app?.appName && (
            <span
              className="text-xs font-mono px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#666680', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {app.appName}
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            id="refresh-preview-btn"
            onClick={handleRefresh}
            title="Refresh"
            className="p-2 rounded-lg transition-all btn-ghost"
            style={{ color: '#555568' }}
          >
            <RotateCw size={14} className={isCompiling ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Preview viewport */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6" style={{ background: '#0a0a10' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden shadow-2xl"
            style={{
              width: activeDevice.width ? activeDevice.width + 'px' : '100%',
              maxWidth: activeDevice.width ? activeDevice.width + 'px' : '100%',
              height: activeDevice.height ? activeDevice.height + 'px' : '100%',
              minHeight: activeDevice.height ? activeDevice.height + 'px' : 480,
              borderRadius: device === 'mobile' ? 28 : device === 'tablet' ? 20 : 12,
              background: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: device !== 'desktop'
                ? '0 40px 80px rgba(0,0,0,0.7), 0 0 0 8px rgba(255,255,255,0.04), 0 0 0 9px rgba(255,255,255,0.02)'
                : '0 8px 48px rgba(0,0,0,0.6)',
            }}
          >
            {iframeSrcDoc ? (
              <iframe
                ref={iframeRef}
                title="Live Preview"
                srcDoc={iframeSrcDoc}
                className="w-full h-full border-0"
                style={{ borderRadius: 'inherit', display: 'block' }}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: '#0d0d14' }}>
                <div
                  className="w-12 h-12 rounded-full animate-spin mb-4"
                  style={{ border: '2px solid rgba(124,110,255,0.15)', borderTopColor: 'var(--color-accent)' }}
                />
                <p className="text-sm font-medium" style={{ color: '#555568' }}>Waiting for app…</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
