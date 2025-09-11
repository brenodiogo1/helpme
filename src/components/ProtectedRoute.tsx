"use client";

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { showError } from '@/utils/toast';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { session, userRole, isLoading } = useAuth();

  if (isLoading) {
    // Optionally render a loading spinner or placeholder
    return <div className="flex items-center justify-center min-h-screen">Carregando autenticação...</div>;
  }

  if (!session) {
    showError("Você precisa estar logado para acessar esta página.");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    showError("Você não tem permissão para acessar esta página.");
    // Redirect based on role or to a generic unauthorized page
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'cleaner') return <Navigate to="/dashboard" replace />;
    if (userRole === 'customer') return <Navigate to="/account" replace />;
    return <Navigate to="/" replace />; // Fallback to home
  }

  return <Outlet />;
};

export default ProtectedRoute;