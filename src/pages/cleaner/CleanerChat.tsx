"use client";

import React, { useState } from "react";
import ChatWindow from "@/components/ChatWindow";

const mockCleanerMessages = [
  { id: "1", sender: "admin" as const, senderName: "Admin", text: "Olá Anna, como posso ajudar hoje?", timestamp: "2024-07-26T10:00:00Z", avatarUrl: "https://i.pravatar.cc/150?img=11" },
  { id: "2", sender: "user" as const, text: "Olá! Tenho uma dúvida sobre um agendamento para a próxima semana.", timestamp: "2024-07-26T10:05:00Z" },
  { id: "3", sender: "admin" as const, senderName: "Admin", text: "Claro, qual é o ID do agendamento ou o nome do cliente?", timestamp: "2024-07-26T10:07:00Z", avatarUrl: "https://i.pravatar.cc/150?img=11" },
  { id: "4", sender: "user" as const, text: "É o agendamento B005 com Henk Groot.", timestamp: "2024-07-26T10:10:00Z" },
];

const CleanerChat = () => {
  const [messages, setMessages] = useState(mockCleanerMessages);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: String(messages.length + 1),
      sender: "user" as const,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // A resposta automática foi removida para permitir comunicação manual.
  };

  return (
    <ChatWindow
      title="Chat com o Administrador"
      description="Converse com a equipe de suporte 24/7."
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserAvatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop" // Cleaner's avatar
      currentUserFallback="A"
    />
  );
};

export default CleanerChat;