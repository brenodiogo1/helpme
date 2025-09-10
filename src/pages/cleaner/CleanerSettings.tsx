import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { showSuccess } from "@/utils/toast";

const CleanerSettings = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Instellingen opgeslagen!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instellingen</CardTitle>
        <CardDescription>Beheer je account- en notificatie-instellingen.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Notificaties</h3>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="new-booking">Nieuwe boeking</Label>
              <Switch id="new-booking" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="cancellation">Annulering</Label>
              <Switch id="cancellation" defaultChecked />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold">Wachtwoord Wijzigen</h3>
            <div className="space-y-2">
              <Label htmlFor="current-password">Huidig wachtwoord</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nieuw wachtwoord</Label>
              <Input id="new-password" type="password" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Opslaan</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CleanerSettings;