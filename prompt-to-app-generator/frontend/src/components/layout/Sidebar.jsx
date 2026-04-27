import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, TerminalSquare, FolderOpen, GitBranch,
  Settings, LayoutTemplate, LogOut, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { name: 'Dashboard',      icon: LayoutDashboard, path: '/app/dashboard' },
  { name: 'Prompt Studio',  icon: TerminalSquare,  path: '/app/studio',   accent: true },
  { name: 'Projects',       icon: FolderOpen,      path: '/app/projects' },
  { name: 'Templates',      icon: LayoutTemplate,  path: '/app/templates' },
  { name: 'Version Control',icon: GitBranch,       path: '/app/versions' },
  { name: 'Settings',       icon: Settings,        path: '/app/settings' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className="w-64 flex flex-col"
      style={{
        background: 'rgba(8,8,14,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c6eff 0%, #5b4de8 100%)' }}
        >
          <TerminalSquare size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">
          Build<span style={{ color: 'var(--color-accent)' }}>iX</span>
        </span>
        <div
          className="ml-auto badge badge-accent text-xs"
          style={{ fontSize: '0.65rem', padding: '2px 7px' }}
        >
          Beta
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
        {links.map((link, i) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  size={17}
                  className="flex-shrink-0"
                  style={{ color: isActive ? 'var(--color-accent)' : undefined }}
                />
                <span>{link.name}</span>
                {link.accent && (
                  <div
                    className="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-green)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* User tile */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c6eff, #5b4de8)',
              color: '#fff',
            }}
          >
            {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || user?.email || 'User'}</p>
            <p className="text-xs truncate" style={{ color: '#555568' }}>Pro Plan</p>
          </div>
        </div>

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="btn-ghost w-full justify-start"
          style={{ color: '#555568', padding: '8px 12px' }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
