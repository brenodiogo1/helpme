"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AwaitingApproval: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="mx-auto max-w-md w-full text-center">
        <CardHeader>
          <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Wachten op goedkeuring</CardTitle>
          <CardDescription>
            Bedankt voor je aanmelding als schoonmaker! Je profiel wordt momenteel beoordeeld door ons team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We streven ernaar om alle aanmeldingen binnen 24-48 uur te verwerken. Je ontvangt een e-mail zodra je profiel is goedgekeurd.
          </p>
          <p className="text-sm text-muted-foreground">
            In de tussentijd kun je uitloggen en later terugkomen.
          </p>
          <Button onClick={signOut} variant="outline">
            Uitloggen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AwaitingApproval;