"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  googleMapsApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  sendGridApiKey: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: string) => void;
}

const defaultSettings: AppSettings = {
  googleMapsApiKey: "",
  twilioAccountSid: "",
  twilioAuthToken: "",
  twilioPhoneNumber: "",
  sendGridApiKey: "",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('appSettings');
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }
    return defaultSettings;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings]);

  const updateSetting = (key: keyof AppSettings, value: string) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};