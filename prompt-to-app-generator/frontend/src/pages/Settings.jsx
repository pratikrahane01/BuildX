import React, { useState, useEffect } from 'react';
import { User, Key, Bell, Shield, Palette, CheckCircle2, Loader2, Save, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const TABS = [
  { name: 'Profile',      icon: User,    desc: 'Personal info'      },
  { name: 'Appearance',   icon: Palette, desc: 'Theme & display'    },
  { name: 'API Keys',     icon: Key,     desc: 'Manage credentials' },
  { name: 'Notifications',icon: Bell,    desc: 'Alert preferences'  },
  { name: 'Security',     icon: Shield,  desc: 'Password & access'  },
];

/* ── Toggle switch ─────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-6 rounded-full transition-all flex-shrink-0"
      style={{
        background: checked ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
        boxShadow: checked ? '0 0 12px rgba(124,110,255,0.4)' : 'none',
      }}
    >
      <motion.div
        animate={{ x: checked ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
      />
    </button>
  );
}

/* ── Setting row ────────────────────────────────────────── */
function SettingRow({ label, desc, control }) {
  return (
    <div
      className="flex items-center justify-between py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: '#666680' }}>{desc}</p>}
      </div>
      {control}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────── */
function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm rounded-lg px-3 py-2 outline-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#d8d8e8',
        cursor: 'pointer',
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ── Input ──────────────────────────────────────────────── */
function SettingsInput({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field"
      style={{ maxWidth: 320 }}
    />
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifToggles, setNotifToggles] = useState({
    email: true, push: false, weekly: true, products: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3" style={{ color: '#7878a0' }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading settings…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm" style={{ color: '#7878a0' }}>Manage your account and preferences.</p>
      </motion.div>

      <div className="flex gap-8">
        {/* Sidebar tabs */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => {
              const active = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  id={`settings-tab-${tab.name.toLowerCase()}`}
                  onClick={() => setActiveTab(tab.name)}
                  className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                  style={{
                    background: active ? 'rgba(124,110,255,0.1)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(124,110,255,0.2)' : 'transparent'}`,
                    color: active ? '#d8d0ff' : '#666680',
                    position: 'relative',
                  }}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                      style={{ background: 'var(--color-accent)' }}
                    />
                  )}
                  <tab.icon size={16} style={{ color: active ? 'var(--color-accent)' : '#555568', flexShrink: 0 }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{tab.name}</p>
                    <p className="text-xs leading-tight" style={{ color: active ? '#9090c0' : '#3a3a54' }}>{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              {/* Profile */}
              {activeTab === 'Profile' && (
                <div
                  className="rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <h2 className="text-base font-semibold text-white mb-6">Profile Information</h2>

                  {/* Avatar section */}
                  <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                      style={{ background: 'linear-gradient(135deg, #7c6eff, #5b4de8)', color: '#fff' }}
                    >
                      {(settings?.displayName?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">{settings?.displayName || 'User'}</p>
                      <p className="text-xs mb-3" style={{ color: '#555568' }}>{settings?.email || 'user@example.com'}</p>
                      <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                        Change avatar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#888899' }}>Display Name</label>
                      <SettingsInput
                        value={settings?.displayName || ''}
                        onChange={v => handleChange('displayName', v)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#888899' }}>Email Address</label>
                      <SettingsInput
                        type="email"
                        value={settings?.email || ''}
                        onChange={v => handleChange('email', v)}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        id="save-profile-btn"
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                        style={{ padding: '9px 18px' }}
                      >
                        {saving
                          ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                          : <><Save size={14} /> Save Changes</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Preferences — always visible */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h2 className="text-base font-semibold text-white mb-2">AI Preferences</h2>
                <p className="text-xs mb-5" style={{ color: '#555568' }}>Configure how BuildiX generates your apps.</p>

                <SettingRow
                  label="Default Framework"
                  desc="Primary framework used for generation"
                  control={
                    <SelectField
                      value={settings?.defaultFramework || 'React (Vite)'}
                      onChange={v => { handleChange('defaultFramework', v); toast.success('Preference updated'); }}
                      options={['React (Vite)', 'Next.js', 'Vue 3']}
                    />
                  }
                />
                <SettingRow
                  label="Default Styling"
                  desc="Preferred CSS solution for generated apps"
                  control={
                    <SelectField
                      value={settings?.defaultStyling || 'Tailwind CSS'}
                      onChange={v => { handleChange('defaultStyling', v); toast.success('Preference updated'); }}
                      options={['Tailwind CSS', 'CSS Modules', 'Styled Components']}
                    />
                  }
                />
              </div>

              {/* Notifications */}
              {activeTab === 'Notifications' && (
                <div
                  className="rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <h2 className="text-base font-semibold text-white mb-5">Notification Preferences</h2>
                  {[
                    { key: 'email',   label: 'Email notifications',   desc: 'Receive updates about your apps via email' },
                    { key: 'push',    label: 'Push notifications',     desc: 'Browser push alerts for generation status' },
                    { key: 'weekly',  label: 'Weekly digest',          desc: 'Summary of your activity each week' },
                    { key: 'products',label: 'Product updates',         desc: 'New features and improvements' },
                  ].map(n => (
                    <SettingRow
                      key={n.key}
                      label={n.label}
                      desc={n.desc}
                      control={
                        <Toggle
                          checked={notifToggles[n.key]}
                          onChange={v => setNotifToggles(prev => ({ ...prev, [n.key]: v }))}
                        />
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
