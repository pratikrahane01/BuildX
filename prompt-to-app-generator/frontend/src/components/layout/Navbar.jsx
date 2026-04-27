import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, ChevronDown, Command, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: 1, text: 'App "E-commerce Dashboard" generated', time: '2m ago', dot: 'var(--color-green)' },
    { id: 2, text: 'Template "SaaS Landing" is ready', time: '1h ago', dot: 'var(--color-accent)' },
    { id: 3, text: 'Version snapshot auto-saved', time: '3h ago', dot: '#fbbf24' },
  ];

  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: 'rgba(5,5,8,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        zIndex: 40,
      }}
    >
      {/* Search */}
      <div
        className="relative flex items-center"
        style={{ width: searchFocused ? 360 : 280, transition: 'width 0.3s ease' }}
      >
        <div
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-all"
          style={{
            background: searchFocused ? 'rgba(124,110,255,0.06)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${searchFocused ? 'rgba(124,110,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: searchFocused ? '0 0 0 3px rgba(124,110,255,0.1)' : 'none',
          }}
        >
          <Search size={14} style={{ color: searchFocused ? 'var(--color-accent)' : '#555568', flexShrink: 0 }} />
          <input
            ref={searchRef}
            id="global-search"
            type="text"
            placeholder="Search projects, prompts…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent border-none outline-none text-sm w-full"
            style={{ color: '#e8e8f0', '::placeholder': { color: '#444456' } }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="flex-shrink-0" style={{ color: '#555568' }}>
              <X size={13} />
            </button>
          )}
          {!searchFocused && !query && (
            <div
              className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#555568', fontSize: '0.7rem' }}
            >
              <Command size={10} /> K
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => setShowNotifs(v => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: showNotifs ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { if (!showNotifs) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
          >
            <Bell size={16} style={{ color: '#888899' }} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--color-accent)', boxShadow: '0 0 6px var(--color-accent)' }}
            />
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden animate-in"
              style={{
                background: 'rgba(13,13,20,0.97)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                zIndex: 100,
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                  {notifications.length} new
                </span>
              </div>
              <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'rgba(255,255,255,0.04)' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ color: '#c8c8d8' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{n.text}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#555568' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button className="text-xs font-medium w-full text-center transition-colors" style={{ color: 'var(--color-accent)' }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* User avatar */}
        <button
          id="user-menu-btn"
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c6eff, #22d3ee)', color: '#fff' }}
          >
            {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium leading-tight" style={{ color: '#d8d8e8' }}>
              {user?.name || 'User'}
            </p>
            <p className="text-xs leading-tight" style={{ color: '#555568' }}>Pro Plan</p>
          </div>
          <ChevronDown size={13} style={{ color: '#555568' }} />
        </button>
      </div>
    </header>
  );
}
