"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  googleMapsApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  sendGridApiKey: string;
  platformCommissionPercentage: number;
  baseHourlyRate: number;
  serviceFeeFixed: number;
}

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const defaultSettings: AppSettings = {
  googleMapsApiKey: '',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '',
  sendGridApiKey: '',
  platformCommissionPercentage: 0,
  baseHourlyRate: 16.90,
  serviceFeeFixed: 2.90,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from app_settings for general settings
      const { data: appSettingsData, error: appSettingsError } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (appSettingsError && appSettingsError.code !== 'PGRST116') {
        console.warn("No app_settings found, using defaults for some fields:", appSettingsError.message);
      }

      // Fetch base_hourly_rate and service_fee from the 'services' table
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('base_hourly_rate, service_fee')
        .eq('name', 'Find a cleaner')
        .single();

      if (serviceError && serviceError.code !== 'PGRST116') {
        console.error("Failed to fetch 'Find a cleaner' service settings:", serviceError);
        throw serviceError;
      }

      setSettings({
        googleMapsApiKey: appSettingsData?.google_maps_api_key || defaultSettings.googleMapsApiKey,
        twilioAccountSid: appSettingsData?.twilio_account_sid || defaultSettings.twilioAccountSid,
        twilioAuthToken: appSettingsData?.twilio_auth_token || defaultSettings.twilioAuthToken,
        twilioPhoneNumber: appSettingsData?.twilio_phone_number || defaultSettings.twilioPhoneNumber,
        sendGridApiKey: appSettingsData?.send_grid_api_key || defaultSettings.sendGridApiKey,
        platformCommissionPercentage: appSettingsData?.platform_commission_percentage || defaultSettings.platformCommissionPercentage,
        baseHourlyRate: serviceData?.base_hourly_rate || defaultSettings.baseHourlyRate,
        serviceFeeFixed: serviceData?.service_fee || defaultSettings.serviceFeeFixed,
      });
    } catch (err: any) {
      console.error("Failed to fetch settings:", err);
      setError(err.message || "Failed to load application settings.");
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
    // In a real app, you'd also persist this to Supabase here
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings, updateSetting }}>
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