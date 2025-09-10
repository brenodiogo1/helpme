"use client";

import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface ChatContact {
  id: string;
  name: string;
  avatarUrl: string;
  type: 'cleaner' | 'customer';
  lastMessage: string;
}

interface Message {
  id: string;
  sender: 'user' | 'other' | 'admin';
  text: string;
  timestamp: string;
  senderName?: string;
  avatarUrl?: string;
}

const AdminChat = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [loadingAdminProfile, setLoadingAdminProfile] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setLoadingAdminProfile(false);
        setContactsError("U moet ingelogd zijn om de admin chat te gebruiken.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles') // Assuming admin also has a profile entry
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(error.message);
        }
        setAdminProfile({
          name: `${data?.first_name || 'Admin'} ${data?.last_name || ''}`,
          avatarUrl: data?.avatar_url || `https://ui-avatars.com/api/?name=${data?.first_name || 'A'}&background=random`,
          fallback: (data?.first_name?.charAt(0) || 'A'),
        });
      } catch (err: any) {
        showError(err.message);
        setContactsError(err.message);
      } finally {
        setLoadingAdminProfile(false);
      }
    };

    const fetchContacts = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setLoadingContacts(false);
        return;
      }

      setLoadingContacts(true);
      try {
        // Fetch cleaners
        const { data: cleanersData, error: cleanersError } = await supabase
          .from('cleaners')
          .select('id, name, photo_url');
        if (cleanersError) throw new Error(cleanersError.message);

        const cleanerContacts: ChatContact[] = cleanersData.map(c => ({
          id: `cleaner-${c.id}`,
          name: c.name,
          avatarUrl: c.photo_url || `https://ui-avatars.com/api/?name=${c.name.charAt(0)}&background=random`,
          type: 'cleaner',
          lastMessage: "Geen recente berichten", // Placeholder
        }));

        // Fetch customers
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .neq('id', user.id); // Exclude admin's own profile
        if (profilesError) throw new Error(profilesError.message);

        const customerContacts: ChatContact[] = profilesData.map(p => ({
          id: `customer-${p.id}`,
          name: `${p.first_name} ${p.last_name}`,
          avatarUrl: p.avatar_url || `https://ui-avatars.com/api/?name=${p.first_name.charAt(0)}&background=random`,
          type: 'customer',
          lastMessage: "Geen recente berichten", // Placeholder
        }));

        setContacts([...cleanerContacts, ...customerContacts]);
      } catch (err: any) {
        setContactsError(err.message);
        showError(err.message);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchAdminProfile();
    fetchContacts();
  }, [isAuthLoading, user]);

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    // In a real app, you'd fetch messages for this contact from a database
    setCurrentMessages([
      { id: "1", sender: "other", senderName: contact.name, text: `Hallo, ik ben ${contact.name}. Hoe kan ik u helpen?`, timestamp: new Date().toISOString(), avatarUrl: contact.avatarUrl },
    ]);
  };

  const handleSendMessage = (text: string) => {
    if (selectedContact) {
      const newMessage: Message = {
        id: String(currentMessages.length + 1),
        sender: "user",
        text,
        timestamp: new Date().toISOString(),
      };
      setCurrentMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        const simulatedResponse: Message = {
          id: String(currentMessages.length + 2),
          sender: "other",
          senderName: selectedContact.name,
          text: "Bedankt voor uw bericht, ik kom er zo snel mogelijk op terug.",
          timestamp: new Date().toISOString(),
          avatarUrl: selectedContact.avatarUrl,
        };
        setCurrentMessages((prev) => [...prev, simulatedResponse]);
      }, 1500);
    }
  };

  if (isAuthLoading || loadingAdminProfile || loadingContacts) {
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

  if (contactsError) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mt-2">Fout</CardTitle>
            <CardDescription className="text-red-500">{contactsError}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-100px)]">
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Conversaties</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            <div className="divide-y">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted",
                    selectedContact?.id === contact.id && "bg-muted"
                  )}
                  onClick={() => handleSelectContact(contact)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatarUrl} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        {selectedContact ? (
          <ChatWindow
            title={`Chat met ${selectedContact.name}`}
            description={`Conversatie met ${selectedContact.type === 'cleaner' ? 'de schoonmaker' : 'de klant'} ${selectedContact.name}`}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            currentUserAvatar={adminProfile?.avatarUrl}
            currentUserFallback={adminProfile?.fallback}
          />
        ) : (
          <Card className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Selecteer een conversatie om te beginnen.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminChat;