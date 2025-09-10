import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { showSuccess } from "@/utils/toast";

const AdminSettings = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Instellingen opgeslagen! (Simulatie)");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Instellingen</CardTitle>
          <CardDescription>
            Beheer hier de algemene instellingen van het platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Instellingen zoals tarieven, commissies en e-mailnotificaties komen hier.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Instellingen</CardTitle>
          <CardDescription>
            Voer hier je API-sleutels in voor de betalingsverwerking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="stripe-key">Stripe API Key</Label>
              <Input id="stripe-key" placeholder="sk_test_..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-key">PayPal Client ID</Label>
              <Input id="paypal-key" placeholder="AZ..." />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Opslaan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;