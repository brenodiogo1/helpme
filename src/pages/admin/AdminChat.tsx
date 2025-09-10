"use client";

import { useState } from "react"; // Removido React
import ChatWindow from "@/components/ChatWindow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

// Mock data for admin's profile
const adminProfile = {
  name: "Admin HelpMe",
  avatarUrl: "https://i.pravatar.cc/150?img=12", // Generic admin avatar
  fallback: "A",
};

// Mock data for active conversations
const mockContacts: ChatContact[] = [
  {
    id: "cleaner-1",
    name: "Anna de Vries",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
    type: "cleaner",
    lastMessage: "Oké, ik bevestig de afspraak voor morgen.",
  },
  {
    id: "customer-1",
    name: "Piet H.",
    avatarUrl: "https://i.pravatar.cc/150?img=7",
    type: "customer",
    lastMessage: "Wanneer kan de schoonmaker komen?",
  },
  {
    id: "cleaner-2",
    name: "Ben Janssen",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop",
    type: "cleaner",
    lastMessage: "Ik heb een vraag over mijn uitbetaling.",
  },
  {
    id: "customer-2",
    name: "Janneke S.",
    avatarUrl: "https://i.pravatar.cc/150?img=8",
    type: "customer",
    lastMessage: "Kan ik mijn boeking wijzigen?",
  },
];

// Mock messages for each contact
const mockMessages: { [key: string]: Message[] } = {
  "cleaner-1": [
    { id: "1", sender: "other", senderName: "Anna de Vries", text: "Olá Admin, tenho uma dúvida sobre o agendamento B005.", timestamp: "2024-07-26T10:00:00Z", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop" },
    { id: "2", sender: "user", text: "Olá Anna! Qual é a sua dúvida?", timestamp: "2024-07-26T10:05:00Z" },
    { id: "3", sender: "other", senderName: "Anna de Vries", text: "O cliente pediu para mudar o horário para 11h.", timestamp: "2024-07-26T10:07:00Z", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop" },
    { id: "4", sender: "user", text: "Ok, vou verificar a disponibilidade e te retorno.", timestamp: "2024-07-26T10:10:00Z" },
  ],
  "customer-1": [
    { id: "1", sender: "other", senderName: "Piet H.", text: "Olá, gostaria de saber se posso agendar uma limpeza para amanhã.", timestamp: "2024-07-26T11:00:00Z", avatarUrl: "https://i.pravatar.cc/150?img=7" },
    { id: "2", sender: "user", text: "Olá Piet! Qual é o seu código postal e horário preferido?", timestamp: "2024-07-26T11:05:00Z" },
  ],
  "cleaner-2": [
    { id: "1", sender: "other", senderName: "Ben Janssen", text: "Minha última fatura está incorreta.", timestamp: "2024-07-26T12:00:00Z", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop" },
    { id: "2", sender: "user", text: "Por favor, envie os detalhes para que eu possa verificar.", timestamp: "2024-07-26T12:05:00Z" },
  ],
  "customer-2": [
    { id: "1", sender: "other", senderName: "Janneke S.", text: "Preciso cancelar uma reserva.", timestamp: "2024-07-26T13:00:00Z", avatarUrl: "https://i.pravatar.cc/150?img=8" },
    { id: "2", sender: "user", text: "Qual é o ID da reserva, por favor?", timestamp: "2024-07-26T13:05:00Z" },
  ],
};

const AdminChat = () => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
    setCurrentMessages(mockMessages[contact.id] || []);
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

      // Simulate a response from the selected contact
      setTimeout(() => {
        const simulatedResponse: Message = {
          id: String(currentMessages.length + 2),
          sender: "other",
          senderName: selectedContact.name,
          text: "Obrigado pela sua mensagem, vou verificar isso.",
          timestamp: new Date().toISOString(),
          avatarUrl: selectedContact.avatarUrl,
        };
        setCurrentMessages((prev) => [...prev, simulatedResponse]);
      }, 1500);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-100px)]">
      {/* Sidebar de Contatos */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Conversas</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            <div className="divide-y">
              {mockContacts.map((contact) => (
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

      {/* Janela de Chat */}
      <div className="md:col-span-2">
        {selectedContact ? (
          <ChatWindow
            title={`Chat com ${selectedContact.name}`}
            description={`Conversa com ${selectedContact.type === 'cleaner' ? 'o limpador' : 'o cliente'} ${selectedContact.name}`}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            currentUserAvatar={adminProfile.avatarUrl}
            currentUserFallback={adminProfile.fallback}
          />
        ) : (
          <Card className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Selecione uma conversa para começar.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminChat;