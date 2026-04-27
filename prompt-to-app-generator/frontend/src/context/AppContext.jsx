import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentApp, setCurrentApp] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generationMeta, setGenerationMeta] = useState(null);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);

    const generateNewApp = async (prompt, options = {}) => {
    const { isIterative = false, template = null } = options;
    setIsGenerating(true);
    setGenerationStatus('Generating with AI...');
    if (!isIterative) {
      setCurrentApp(null);
    }
    try {
      const payload = { 
        prompt, 
        existingApp: isIterative ? currentApp : null,
        template,
      };
      const data = await api.generateApp(payload);
      setGenerationMeta(data.generationMeta || null);
      
      if (data.generationMeta?.usedFallback) {
        setGenerationStatus('Fallback preview generated because AI response was invalid. Try regenerating for a full AI result.');
      } else if (data.wasAutoFixed) {
        setGenerationStatus('AI output had issues. Auto-fixed code.');
      } else {
        setGenerationStatus('App generated successfully!');
      }
      
      setCurrentApp(data);
    } catch (error) {
      console.error("Failed to generate app", error);
      setGenerationStatus('An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadTemplates();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await api.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates", error);
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      await loadProjects(); // refresh the list
    } catch (error) {
      console.error("Failed to delete project", error);
      throw error;
    }
  };

  const updateComponent = (componentName, newCode) => {
    if (currentApp) {
      setCurrentApp({
        ...currentApp,
        components: {
          ...currentApp.components,
          [componentName]: newCode
        }
      });
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentApp, 
      isGenerating,
      generationStatus,
      generationMeta,
      projects, 
      templates,
      generateNewApp, 
      loadProjects,
      deleteProject,
      updateComponent,
      setCurrentApp,
      setGenerationStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
