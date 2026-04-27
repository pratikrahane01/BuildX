import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TerminalSquare, Zap, Code2, Layout, ArrowRight, Sparkles, ChevronRight, Globe, Share2 } from 'lucide-react';

/* ── Animated mesh/orb background ────────────────────────── */
function AmbientOrb({ x, y, color, size = 400 }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity: 0.45,
      }}
    />
  );
}

/* ── Typewriter effect ────────────────────────────────────── */
function Typewriter({ words }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    let timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 65);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else {
      setDeleting(false);
      setIndex(i => i + 1);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, index, words]);

  return (
    <span className="gradient-text">
      {displayed}
      <span className="opacity-70 animate-pulse">|</span>
    </span>
  );
}

/* ── Feature card ─────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card glass-hover p-7 relative overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent}22 0%, transparent 70%)`,
        }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
      >
        <Icon size={20} style={{ color: accent }} strokeWidth={1.8} />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: '#7878a0' }}>{desc}</p>
    </motion.div>
  );
}

/* ── Stat ─────────────────────────────────────────────────── */
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm" style={{ color: '#7878a0' }}>{label}</div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function Landing() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 25 });
  const orbX = useTransform(springX, v => `${v}px`);
  const orbY = useTransform(springY, v => `${v}px`);

  useEffect(() => {
    const move = (e) => {
      mouseX.set((e.clientX - window.innerWidth / 2) * 0.04);
      mouseY.set((e.clientY - window.innerHeight / 2) * 0.04);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Generate fully functional prototypes and production-ready code in mere seconds with GPT-4.',
      accent: '#fbbf24',
    },
    {
      icon: Code2,
      title: 'Clean React Code',
      desc: 'Get modular, readable React components styled with modern Tailwind CSS — ready to ship.',
      accent: '#7c6eff',
    },
    {
      icon: Layout,
      title: 'Live Preview',
      desc: 'Instantly see and interact with your generated application right in the browser. No builds needed.',
      accent: '#22d3ee',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'var(--color-bg)', position: 'relative' }}
    >
      {/* Background ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div style={{ x: orbX, y: orbY }}>
          <AmbientOrb x="20%" y="15%" color="rgba(124,110,255,0.6)" size={600} />
          <AmbientOrb x="80%" y="10%" color="rgba(6,182,212,0.35)" size={400} />
          <AmbientOrb x="50%" y="80%" color="rgba(124,110,255,0.25)" size={500} />
        </motion.div>
      </div>

      {/* Grid lines overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(5,5,8,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c6eff, #5b4de8)' }}
            >
              <TerminalSquare size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Build<span style={{ color: 'var(--color-accent)' }}>iX</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Templates', 'Docs'].map(item => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium transition-colors"
                style={{ color: '#666680' }}
                onMouseEnter={e => e.target.style.color = '#e8e8f0'}
                onMouseLeave={e => e.target.style.color = '#666680'}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium transition-colors px-4 py-2 rounded-lg"
              style={{ color: '#888899' }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="btn-primary text-sm"
            >
              Get Started Free
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        {/* Badge pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: 'rgba(124,110,255,0.1)',
              border: '1px solid rgba(124,110,255,0.25)',
              color: '#a090ff',
            }}
          >
            <Sparkles size={13} />
            <span>Powered by GPT-4o · Now in Beta</span>
            <ChevronRight size={13} style={{ opacity: 0.6 }} />
          </div>
        </motion.div>

        <div className="text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-black tracking-tight mb-6 leading-[1.08]"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', color: '#f0f0ff' }}
          >
            From Prompt to{' '}
            <Typewriter words={['Production.', 'React App.', 'Dashboard.', 'Landing Page.', 'SaaS UI.']} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg leading-relaxed mb-12 max-w-2xl mx-auto"
            style={{ color: '#7878a0' }}
          >
            Stop writing boilerplate. Describe your app in plain English and our AI will generate
            a complete, interactive React application — with live preview — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="btn-primary" style={{ padding: '14px 28px', fontSize: '0.9375rem' }}>
              <Sparkles size={16} />
              Start Building Free
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: '#666680' }}
            >
              Already have an account?
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2 text-sm"
            style={{ color: '#555568' }}
          >
            <div className="flex -space-x-2">
              {['#7c6eff','#22d3ee','#fbbf24','#f472b6'].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: 'var(--color-bg)', background: c, color: '#fff' }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>Join <strong className="text-white">2,400+</strong> developers building faster</span>
          </motion.div>
        </div>

        {/* ── Hero Demo Mockup ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 relative mx-auto max-w-4xl"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Fake window chrome */}
            <div
              className="flex items-center gap-2 px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <div
                className="ml-4 flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#555568', maxWidth: 320 }}
              >
                <Layout size={11} />
                buildix.dev/app/studio
              </div>
            </div>
            {/* Content */}
            <div className="flex" style={{ height: 340 }}>
              {/* Left prompt area */}
              <div className="w-72 flex flex-col p-4 gap-3" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs font-medium mb-1" style={{ color: '#555568' }}>PROMPT STUDIO</div>
                <div
                  className="flex items-start gap-3 p-3 rounded-xl text-xs"
                  style={{ background: 'rgba(124,110,255,0.1)', border: '1px solid rgba(124,110,255,0.2)' }}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent)' }}>
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <span style={{ color: '#c8c8e0', lineHeight: 1.5 }}>Build a SaaS dashboard with analytics charts and a user table</span>
                </div>
                <div
                  className="flex items-start gap-3 p-3 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white">
                    <Code2 size={10} className="text-black" />
                  </div>
                  <span style={{ color: '#7878a0' }}>Generating React components... ✓</span>
                </div>
                <div className="mt-auto">
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span style={{ color: '#444456', flex: 1 }}>Iterate your app…</span>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
                      <ArrowRight size={10} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Right preview area */}
              <div className="flex-1 p-4" style={{ background: '#0a0a10' }}>
                <div className="h-full rounded-lg overflow-hidden" style={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex gap-1.5">
                      {['#555','#444','#444'].map((c,i) => <div key={i} className="h-1.5 rounded-full" style={{ background: c, width: i===0 ? 48 : i===1 ? 36 : 56 }} />)}
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {[['#7c6eff','12'], ['#22d3a0','142'], ['#fbbf24','98%']].map(([c, v], i) => (
                      <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="w-4 h-4 rounded mb-2" style={{ background: `${c}30` }} />
                        <div className="text-lg font-bold text-white">{v}</div>
                        <div className="text-xs mt-1" style={{ color: '#555568' }}>Metric {i+1}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mx-4 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {[1,2,3].map(r => (
                      <div key={r} className="flex items-center gap-3 py-2" style={{ borderBottom: r < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div className="w-5 h-5 rounded-full skeleton" />
                        <div className="h-2 rounded skeleton" style={{ width: 80 + r * 15 }} />
                        <div className="ml-auto h-2 rounded skeleton" style={{ width: 40 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow under card */}
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2"
            style={{
              width: '60%',
              height: 80,
              background: 'radial-gradient(ellipse, rgba(124,110,255,0.4) 0%, transparent 70%)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>

        {/* ── Stats ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 pb-12"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <Stat value="2.4k+" label="Developers" />
          <Stat value="18k+" label="Apps Generated" />
          <Stat value="< 8s" label="Avg. Generation" />
          <Stat value="99.9%" label="Uptime" />
        </motion.div>

        {/* ── Features ─────────────────────────────────────── */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="badge badge-accent mb-4 mx-auto" style={{ display: 'inline-flex' }}>
              <Sparkles size={11} /> Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to ship faster</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#7878a0' }}>
              BuildiX handles the boilerplate so you can focus on building what matters.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>

        {/* ── CTA Banner ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-28 rounded-2xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(124,110,255,0.15) 0%, rgba(6,182,212,0.1) 100%)',
            border: '1px solid rgba(124,110,255,0.2)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 0%, rgba(124,110,255,0.25) 0%, transparent 60%)' }}
          />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative">
            Ready to build at the speed of thought?
          </h2>
          <p className="mb-8 text-lg relative" style={{ color: '#7878a0' }}>
            Start free. No credit card required.
          </p>
          <Link to="/signup" className="btn-primary relative" style={{ padding: '14px 32px', fontSize: '0.9375rem' }}>
            <Sparkles size={16} />
            Start Building Now
          </Link>
        </motion.div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ borderColor: 'var(--color-border)', padding: '40px 24px' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c6eff, #5b4de8)' }}
            >
              <TerminalSquare size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">BuildiX</span>
          </div>
          <p className="text-sm" style={{ color: '#444456' }}>
            © 2026 BuildiX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="btn-ghost" style={{ padding: '6px' }}>
              <Globe size={16} style={{ color: '#666680' }} />
            </a>
            <a href="#" className="btn-ghost" style={{ padding: '6px' }}>
              <Share2 size={16} style={{ color: '#666680' }} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
