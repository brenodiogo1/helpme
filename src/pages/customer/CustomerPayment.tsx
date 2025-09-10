import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus } from "lucide-react";

const CustomerPayment = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Betaalmethoden</CardTitle>
        <CardDescription>Beheer hier je opgeslagen betaalmethoden.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="font-semibold">Visa **** 4242</p>
                    <p className="text-sm text-muted-foreground">Vervalt op 12/26</p>
                </div>
            </div>
            <Button variant="ghost" size="sm">Verwijderen</Button>
        </div>
        <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe methode toevoegen
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomerPayment;