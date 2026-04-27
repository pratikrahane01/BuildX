import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden text-white selection:bg-white/20">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden border-l border-zinc-900">
        <Navbar />
        <main className="flex-1 overflow-y-auto relative bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
