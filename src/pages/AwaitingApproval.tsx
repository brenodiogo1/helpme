"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AwaitingApproval: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="mx-auto max-w-md w-full text-center">
        <CardHeader>
          <Clock className="h-12 w-12 text-yellow-500 mx-auto" />
          <CardTitle className="text-2xl mt-4">Wachten op goedkeuring</CardTitle>
          <CardDescription>
            Je account als schoonmaker is aangemaakt en wacht op goedkeuring door ons team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We controleren je gegevens zorgvuldig. Je ontvangt een e-mail zodra je profiel is goedgekeurd.
            Dit duurt meestal 1-2 werkdagen.
          </p>
          <Button onClick={signOut} variant="outline" className="w-full">
            Uitloggen
          </Button>
          <Button asChild className="w-full">
            <Link to="/">Terug naar Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AwaitingApproval;