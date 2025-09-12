"use client";

import React, { useEffect } from 'react';
import { routeAfterAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    routeAfterAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="mx-auto max-w-sm w-full text-center">
        <CardHeader>
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Bezig met omleiden...</CardTitle>
          <CardContent>
            <p className="text-muted-foreground">Even geduld terwijl we je doorsturen.</p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default AuthCallback;