"use client";

import React, { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import { useLocation } from "react-router-dom";

const mockCustomerMessages = [
  { id: "1", sender: "other" as const, senderName: "Anna de Vries", text: "Olá Piet, como posso ajudar com a sua limpeza?", timestamp: "2024-07-26T11:00:00Z", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop" },
  { id: "2", sender: "user" as const, text: "Olá Anna! Gostaria de confirmar o horário para amanhã.", timestamp: "2024-07-26T11:05:00Z" },
  { id: "3", sender: "other" as const, senderName: "Anna de Vries", text: "Confirmado para as 10h. Vejo você lá!", timestamp: "2024-07-26T11:07:00Z", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop" },
];

const CustomerChat = () => {
  const location = useLocation();
  const { cleanerName = "Limpador", cleanerAvatar = "" } = location.state || {};
  const [messages, setMessages] = useState(mockCustomerMessages);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: String(messages.length + 1),
      sender: "user" as const, // Explicitly cast to 'user'
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate cleaner response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          sender: "other" as const, // Explicitly cast to 'other'
          senderName: cleanerName,
          text: "Obrigado por confirmar!",
          timestamp: new Date().toISOString(),
          avatarUrl: cleanerAvatar,
        },
      ]);
    }, 1500);
  };

  return (
    <ChatWindow
      title={`Chat com ${cleanerName}`}
      description="Converse sobre os detalhes da sua reserva."
      messages={messages}
      onSendMessage={handleSendMessage}
      currentUserAvatar="https://i.pravatar.cc/150?img=7" // Customer's avatar
      currentUserFallback="P"
    />
  );
};

export default CustomerChat;