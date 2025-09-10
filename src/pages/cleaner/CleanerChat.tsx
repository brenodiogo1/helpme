"use client";

import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardContent

const CleanerChat = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [cleanerProfile, setCleanerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCleanerProfile = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setLoading(false);
        setError("U moet ingelogd zijn om te chatten.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cleaners')
          .select('name, photo_url')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(error.message);
        }
        setCleanerProfile(data);
      } catch (err: any) {
        showError(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCleanerProfile();
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

  const currentUserAvatar = cleanerProfile?.photo_url || `https://ui-avatars.com/api/?name=${cleanerProfile?.name || 'C'}&background=random`;
  const currentUserFallback = cleanerProfile?.name?.charAt(0) || 'C';

  return (
    <ChatWindow
      title="Chat met de Administrator"
      description="Converse met de supportteam 24/7."
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserAvatar={currentUserAvatar}
      currentUserFallback={currentUserFallback}
    />
  );
};

export default CleanerChat;