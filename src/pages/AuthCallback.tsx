"use client";

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, userRole } = useAuth();

  useEffect(() => {
    if (!isLoading && userRole) {
      // AuthContext's onAuthStateChange already handles the routing
      // This page just needs to exist to catch the redirect
      // If for some reason the routing didn't happen, we can add a fallback here
      console.log("AuthCallback: User role detected, AuthContext should have navigated.");
    } else if (!isLoading && !userRole) {
      // If not loading and no user role (e.g., new user, or error), redirect to login
      console.log("AuthCallback: Not loading, no user role. Redirecting to login.");
      navigate('/login');
    }
  }, [isLoading, userRole, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="mx-auto max-w-sm w-full text-center">
        <CardHeader>
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <CardTitle className="text-2xl mt-4">Authenticatie verwerken...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Even geduld, we leiden je door.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;