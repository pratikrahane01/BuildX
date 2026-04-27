import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

// Pages
import Landing from '../pages/Landing';
import Auth from '../pages/Auth';
import Dashboard from '../pages/Dashboard';
import PromptStudio from '../pages/PromptStudio';
import ProjectManagement from '../pages/ProjectManagement';
import Settings from '../pages/Settings';
import Templates from '../pages/Templates';
import VersionControl from '../pages/VersionControl';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth type="login" />} />
      <Route path="/signup" element={<Auth type="signup" />} />
      
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="studio" element={<PromptStudio />} />
        <Route path="projects" element={<ProjectManagement />} />
        <Route path="templates" element={<Templates />} />
        <Route path="versions" element={<VersionControl />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
