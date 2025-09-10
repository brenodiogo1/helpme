import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'customer' | 'cleaner' | 'admin' | null;

interface User {
  name: string;
  role: Role;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = (userData: User) => {
    setUser(userData);
    // Redireciona para o painel apropriado após o login
    if (userData.role === 'admin') navigate('/admin');
    else if (userData.role === 'cleaner') navigate('/dashboard');
    else if (userData.role === 'customer') navigate('/account');
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};