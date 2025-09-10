"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender: 'user' | 'other' | 'admin';
  text: string;
  timestamp: string;
  senderName?: string;
  avatarUrl?: string;
}

interface ChatWindowProps {
  title: string;
  description?: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUserAvatar?: string;
  currentUserFallback?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  title,
  description,
  messages,
  onSendMessage,
  currentUserAvatar,
  currentUserFallback,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-100px)]">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender !== "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatarUrl} />
                    <AvatarFallback>{msg.senderName?.charAt(0) || msg.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex flex-col max-w-[70%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  }`}
                >
                  {msg.senderName && msg.sender === "other" && (
                    <span className="text-xs font-semibold mb-1">{msg.senderName}</span>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-xs text-right opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.sender === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUserAvatar} />
                    <AvatarFallback>{currentUserFallback}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Typ je bericht..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={false}
          />
          <Button type="submit" onClick={handleSend} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Versturen</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatWindow;