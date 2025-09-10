import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus } from "lucide-react";
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

interface Address {
  id: string;
  label: string;
  address_line_1: string;
  postcode: string;
  city: string;
}

const addressSchema = z.object({
  label: z.string().min(1, { message: "Label is verplicht." }),
  address_line_1: z.string().min(1, { message: "Adres is verplicht." }),
  postcode: z.string().min(4, { message: "Postcode is verplicht." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
});

const CustomerAddresses = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      address_line_1: "",
      postcode: "",
      city: "",
    },
  });

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchAddresses(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw adressen te beheren.");
    }
  }, [isAuthLoading, user]);

  const fetchAddresses = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('customer_addresses') // Assuming a table named 'customer_addresses'
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      setAddresses(data as Address[]);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    form.reset({ label: "", address_line_1: "", postcode: "", city: "" });
    setIsDialogOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    form.reset(address);
    setIsDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    const toastId = showLoading("Adres verwijderen...");
    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId)
        .eq('customer_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      dismissToast(toastId);
      showSuccess("Adres succesvol verwijderd!");
      fetchAddresses(user.id);
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  const onSubmit = async (values: z.infer<typeof addressSchema>) => {
    if (!user) return;
    const toastId = showLoading(editingAddress ? "Adres bijwerken..." : "Adres toevoegen...");
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('customer_addresses')
          .update({
            label: values.label,
            address_line_1: values.address_line_1,
            postcode: values.postcode,
            city: values.city,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAddress.id)
          .eq('customer_id', user.id);

        if (error) throw new Error(error.message);
        showSuccess("Adres succesvol bijgewerkt!");
      } else {
        const { error } = await supabase
          .from('customer_addresses')
          .insert({
            customer_id: user.id,
            label: values.label,
            address_line_1: values.address_line_1,
            postcode: values.postcode,
            city: values.city,
          });

        if (error) throw new Error(error.message);
        showSuccess("Adres succesvol toegevoegd!");
      }
      dismissToast(toastId);
      setIsDialogOpen(false);
      fetchAddresses(user.id);
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Adressen</CardTitle></CardHeader>
        <CardContent><p>Laden van adressen...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Adressen</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mijn Adressen</CardTitle>
            <CardDescription>Beheer hier je opgeslagen adressen.</CardDescription>
          </div>
          <Button onClick={handleAddAddress}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuw adres toevoegen
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-muted-foreground">Je hebt nog geen adressen opgeslagen.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="rounded-lg border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{address.label}</p>
                    <p className="text-sm text-muted-foreground">{address.address_line_1}, {address.postcode}, {address.city}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditAddress(address)}>Bewerken</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(address.id)}>Verwijderen</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Adres Bewerken" : "Nieuw Adres Toevoegen"}</DialogTitle>
            <DialogDescription>
              {editingAddress ? "Werk de gegevens van dit adres bij." : "Voer de details van je nieuwe adres in."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}> {/* Wrap form fields with Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (bijv. Thuis, Werk)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres (straatnaam en huisnummer)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} type="button">Annuleren</Button>
                <Button type="submit">{editingAddress ? "Opslaan" : "Toevoegen"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerAddresses;