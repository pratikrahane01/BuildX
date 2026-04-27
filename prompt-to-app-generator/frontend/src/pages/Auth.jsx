import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { TerminalSquare, Loader2, Eye, EyeOff, ArrowRight, Sparkles, Shield } from 'lucide-react';

/* ── Ambient background ─────────────────────────────────── */
function AuthBg() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div style={{
        position: 'absolute', top: '10%', left: '15%', width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,110,255,0.18) 0%, transparent 70%)',
        filter: 'blur(70px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '10%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

/* ── Input field with floating label ────────────────────── */
function InputField({ id, label, type: typeProp = 'text', value, onChange, placeholder, required, autoComplete, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5 transition-colors"
        style={{ color: focused ? 'var(--color-accent)' : '#888899' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={typeProp}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="input-field focus-ring"
          style={{
            paddingRight: rightSlot ? 44 : 14,
            borderColor: focused ? 'var(--color-accent)' : undefined,
            boxShadow: focused ? '0 0 0 3px rgba(124,110,255,0.15)' : undefined,
          }}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────── */
export default function Auth({ type = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const isLogin = type === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) navigate('/app');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-bg)' }}
    >
      <AuthBg />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(13,13,20,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #7c6eff 0%, #5b4de8 100%)',
                  boxShadow: '0 8px 32px rgba(124,110,255,0.35)',
                }}
              >
                <TerminalSquare size={26} className="text-white" strokeWidth={1.8} />
              </div>
            </motion.div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? (
                <>Sign in to <span style={{ color: 'var(--color-accent)' }}>BuildiX</span></>
              ) : (
                'Create your account'
              )}
            </h1>
            <p className="text-sm" style={{ color: '#666680' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link
                to={isLogin ? '/signup' : '/login'}
                className="font-semibold transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                {isLogin ? 'Sign up free' : 'Sign in'}
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              id="auth-email"
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <InputField
              id="auth-password"
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="transition-colors"
                  style={{ color: '#555568' }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="relative w-4 h-4 rounded transition-all"
                    style={{
                      background: rememberMe ? 'var(--color-accent)' : 'transparent',
                      border: `1.5px solid ${rememberMe ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)'}`,
                    }}
                    onClick={() => setRememberMe(v => !v)}
                  >
                    {rememberMe && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 m-auto"
                        width="10" height="10" viewBox="0 0 10 10"
                      >
                        <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: '#888899' }}>Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: loading ? 'rgba(124,110,255,0.5)' : 'linear-gradient(135deg, #7c6eff 0%, #5b4de8 100%)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,110,255,0.35)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,110,255,0.5)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,110,255,0.35)')}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Processing…</>
              ) : (
                <>{isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Divider & demo hint */}
          <div className="mt-7">
            <div className="divider">or continue with demo</div>
            <button
              type="button"
              onClick={() => { setEmail('demo@buildix.dev'); setPassword('demo1234'); }}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition-all text-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#888899',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#c8c8d8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#888899'; }}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={13} /> Fill demo credentials
              </span>
            </button>
          </div>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs" style={{ color: '#444456' }}>
            <Shield size={11} />
            <span>Secured with end-to-end encryption</span>
          </div>
        </div>

        {/* Bottom link */}
        <p className="mt-6 text-center text-xs" style={{ color: '#444456' }}>
          By signing up you agree to our{' '}
          <a href="#" className="underline underline-offset-2" style={{ color: '#666680' }}>Terms</a>
          {' '}and{' '}
          <a href="#" className="underline underline-offset-2" style={{ color: '#666680' }}>Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
