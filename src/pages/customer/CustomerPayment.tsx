import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Added Form components

interface PaymentMethod {
  id: string;
  card_brand: string;
  last_four: string;
  exp_month: number;
  exp_year: number;
}

const paymentMethodSchema = z.object({
  cardNumber: z.string().min(16, { message: "Kaartnummer moet 16 cijfers bevatten." }).max(16, { message: "Kaartnummer moet 16 cijfers bevatten." }),
  cardHolderName: z.string().min(1, { message: "Naam kaarthouder is verplicht." }),
  expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, { message: "Ongeldige maand (MM)." }),
  expYear: z.string().regex(/^(20)\d{2}$/, { message: "Ongeldig jaar (YYYY)." }),
  cvc: z.string().min(3, { message: "CVC moet 3 of 4 cijfers bevatten." }).max(4, { message: "CVC moet 3 of 4 cijfers bevatten." }),
});

const CustomerPayment = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      cardNumber: "",
      cardHolderName: "",
      expMonth: "",
      expYear: "",
      cvc: "",
    },
  });

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchPaymentMethods(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw betaalmethoden te beheren.");
    }
  }, [isAuthLoading, user]);

  const fetchPaymentMethods = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('customer_payment_methods') // Assuming a table named 'customer_payment_methods'
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      setPaymentMethods(data as PaymentMethod[]);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    form.reset();
    setIsDialogOpen(true);
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!user) return;
    const toastId = showLoading("Betaalmethode verwijderen...");
    try {
      const { error } = await supabase
        .from('customer_payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('customer_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      dismissToast(toastId);
      showSuccess("Betaalmethode succesvol verwijderd!");
      fetchPaymentMethods(user.id);
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    if (!user) return;
    const toastId = showLoading("Betaalmethode toevoegen...");
    try {
      // In a real application, you would tokenize the card details with Stripe.js
      // and only store a payment method ID, not raw card details.
      // For this simulation, we'll store mock data.
      const { error } = await supabase
        .from('customer_payment_methods')
        .insert({
          customer_id: user.id,
          card_brand: "Visa", // Mock brand
          last_four: values.cardNumber.slice(-4),
          exp_month: parseInt(values.expMonth),
          exp_year: parseInt(values.expYear),
        });

      if (error) throw new Error(error.message);
      showSuccess("Betaalmethode succesvol toegevoegd!");
      dismissToast(toastId);
      setIsDialogOpen(false);
      fetchPaymentMethods(user.id);
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Betaalmethoden</CardTitle></CardHeader>
        <CardContent><p>Laden van betaalmethoden...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Betaalmethoden</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Betaalmethoden</CardTitle>
            <CardDescription>Beheer hier je opgeslagen betaalmethoden.</CardDescription>
          </div>
          <Button onClick={handleAddPaymentMethod}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe methode toevoegen
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length === 0 ? (
            <p className="text-muted-foreground">Je hebt nog geen betaalmethoden opgeslagen.</p>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="rounded-lg border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{method.card_brand} **** {method.last_four}</p>
                    <p className="text-sm text-muted-foreground">Vervalt op {method.exp_month}/{method.exp_year}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeletePaymentMethod(method.id)}>Verwijderen</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe Betaalmethode Toevoegen</DialogTitle>
            <DialogDescription>
              Voer de gegevens van je nieuwe betaalmethode in.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}> {/* Wrap form fields with Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="cardHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naam Kaarthouder</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kaartnummer</FormLabel>
                    <FormControl>
                      <Input type="text" inputMode="numeric" pattern="[0-9\s]{13,19}" autoComplete="cc-number" maxLength={16} placeholder="XXXX XXXX XXXX XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vervaldatum (MM)</FormLabel>
                      <FormControl>
                        <Input type="text" inputMode="numeric" pattern="[0-9]{2}" maxLength={2} placeholder="MM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vervaldatum (JJJJ)</FormLabel>
                      <FormControl>
                        <Input type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="JJJJ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cvc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input type="text" inputMode="numeric" pattern="[0-9]{3,4}" maxLength={4} placeholder="CVC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} type="button">Annuleren</Button>
                <Button type="submit">Toevoegen</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerPayment;