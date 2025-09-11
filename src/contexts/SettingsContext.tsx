"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client'; // Assuming this path is correct now

interface AppSettings {
  hourlyRate: number; // Added this property
  platformBookingFee: number;
  // Add other settings here as needed
}

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => void;
}

const defaultSettings: AppSettings = {
  hourlyRate: 25.00, // Default value
  platformBookingFee: 5.00, // Default value
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real application, you would fetch these from a 'settings' table in Supabase
      // For now, we'll use hardcoded values or environment variables
      const { data, error } = await supabase
        .from('app_settings') // Assuming you have a table named 'app_settings'
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found" for .single()
        throw error;
      }

      if (data) {
        setSettings({
          hourlyRate: data.hourly_rate || defaultSettings.hourlyRate,
          platformBookingFee: data.platform_booking_fee || defaultSettings.platformBookingFee,
          // Map other settings from data
        });
      } else {
        // If no settings found in DB, use defaults
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error("Failed to fetch settings:", err);
      setError(err.message || "Failed to load application settings.");
      setSettings(defaultSettings); // Fallback to defaults on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
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