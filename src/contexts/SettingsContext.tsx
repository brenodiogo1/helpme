"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Corrected import path

interface AppSettings {
  hourlyRate: number;
  platformBookingFee: number;
  googleMapsApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  sendGridApiKey: string;
  platformCommissionPercentage: number;
}

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const defaultSettings: AppSettings = {
  hourlyRate: 25.00,
  platformBookingFee: 5.00,
  googleMapsApiKey: '',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '',
  sendGridApiKey: '',
  platformCommissionPercentage: 0,
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
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          hourlyRate: data.hourly_rate || defaultSettings.hourlyRate,
          platformBookingFee: data.platform_booking_fee || defaultSettings.platformBookingFee,
          googleMapsApiKey: data.google_maps_api_key || defaultSettings.googleMapsApiKey,
          twilioAccountSid: data.twilio_account_sid || defaultSettings.twilioAccountSid,
          twilioAuthToken: data.twilio_auth_token || defaultSettings.twilioAuthToken,
          twilioPhoneNumber: data.twilio_phone_number || defaultSettings.twilioPhoneNumber,
          sendGridApiKey: data.send_grid_api_key || defaultSettings.sendGridApiKey,
          platformCommissionPercentage: data.platform_commission_percentage || defaultSettings.platformCommissionPercentage,
        });
      } else {
        setSettings(defaultSettings);
      }
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
    // For now, it's an in-memory update.
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