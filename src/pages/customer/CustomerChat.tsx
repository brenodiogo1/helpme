"use client";

import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card components

const CustomerChat = () => {
  const location = useLocation();
  const { cleanerName = "Limpador" } = location.state || {}; // Removed cleanerAvatar
  const { user, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setLoading(false);
        setError("U moet ingelogd zijn om te chatten.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(error.message);
        }
        setCustomerProfile(data);
      } catch (err: any) {
        showError(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerProfile();
  }, [isAuthLoading, user]);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: String(messages.length + 1),
      sender: "user" as const,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mt-2">Laden...</CardTitle>
            <CardDescription>Chat wordt geladen.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mt-2">Fout</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentUserAvatar = customerProfile?.avatar_url || `https://ui-avatars.com/api/?name=${customerProfile?.first_name || 'C'}&background=random`;
  const currentUserFallback = customerProfile?.first_name?.charAt(0) || 'C';

  return (
    <ChatWindow
      title={`Chat met ${cleanerName}`}
      description="Converse over de details van uw reservering."
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserAvatar={currentUserAvatar}
      currentUserFallback={currentUserFallback}
    />
  );
};

export default CustomerChat;