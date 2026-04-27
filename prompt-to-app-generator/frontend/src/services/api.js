import axios from 'axios';

const API_URL = 'http://localhost:8001/api';

export const api = {
  // Authentication
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  // Projects
  getProjects: async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects', error);
      return [];
    }
  },

  saveProject: async (projectData) => {
    try {
      const response = await axios.post(`${API_URL}/projects/`, projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to save project', error);
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await axios.delete(`${API_URL}/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete project', error);
      throw error;
    }
  },

  // Core AI Generation
  generateApp: async (payload) => {
    try {
      const response = await axios.post(`${API_URL}/studio/generate-app?t=${Date.now()}`, payload, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate app', error);
      throw error;
    }
  },

  regenerateComponent: async (componentName, instruction) => {
    try {
      const response = await axios.post(`${API_URL}/studio/regenerate-component`, { componentName, instruction });
      return response.data;
    } catch (error) {
      console.error('Failed to regenerate component', error);
      throw error;
    }
  },

  fixCode: async (code, errorMsg) => {
    try {
      const response = await axios.post(`${API_URL}/studio/fix-code`, { code, error: errorMsg });
      return response.data;
    } catch (err) {
      console.error('Failed to fix code', err);
      throw err;
    }
  },

  // Templates
  getTemplates: async () => {
    try {
      const response = await axios.get(`${API_URL}/studio/templates`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates', error);
      return [];
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings', error);
      return null;
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await axios.post(`${API_URL}/settings/`, settingsData);
      return response.data;
    } catch (error) {
      console.error('Failed to update settings', error);
      throw error;
    }
  },

  // Version Control
  getVersions: async () => {
    try {
      const response = await axios.get(`${API_URL}/versions/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch versions', error);
      return [];
    }
  },

  createBranch: async (name) => {
    try {
      const response = await axios.post(`${API_URL}/versions/branch`, { name });
      return response.data;
    } catch (error) {
      console.error('Failed to create branch', error);
      throw error;
    }
  },

  revertCommit: async (commitId) => {
    try {
      const response = await axios.post(`${API_URL}/versions/revert`, { commitId });
      return response.data;
    } catch (error) {
      console.error('Failed to revert commit', error);
      throw error;
    }
  }
};
