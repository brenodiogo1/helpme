import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HomeRegistration = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-24 bg-secondary">
      <div className="container max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">{t('homeRegistration.title')}</h2>
        <Tabs defaultValue="klant" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="klant">{t('homeRegistration.customerTab')}</TabsTrigger>
            <TabsTrigger value="schoonmaker">{t('homeRegistration.cleanerTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="klant">
            <Card className="text-left">
              <CardHeader>
                <CardTitle>{t('homeRegistration.customerCardTitle')}</CardTitle>
                <CardDescription>{t('homeRegistration.customerCardDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="klant-naam">{t('homeRegistration.nameLabel')}</Label>
                  <Input id="klant-naam" placeholder="Jan Jansen" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="klant-email">{t('homeRegistration.emailLabel')}</Label>
                  <Input id="klant-email" type="email" placeholder="naam@voorbeeld.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="klant-wachtwoord">{t('homeRegistration.passwordLabel')}</Label>
                  <Input id="klant-wachtwoord" type="password" />
                </div>
                <Button className="w-full">{t('homeRegistration.registerAsCustomer')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schoonmaker">
            <Card className="text-left">
              <CardHeader>
                <CardTitle>{t('homeRegistration.cleanerCardTitle')}</CardTitle>
                <CardDescription>{t('homeRegistration.cleanerCardDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="schoonmaker-naam">{t('homeRegistration.nameLabel')}</Label>
                  <Input id="schoonmaker-naam" placeholder="Jan Jansen" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoonmaker-email">{t('homeRegistration.emailLabel')}</Label>
                  <Input id="schoonmaker-email" type="email" placeholder="naam@voorbeeld.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoonmaker-wachtwoord">{t('homeRegistration.passwordLabel')}</Label>
                  <Input id="schoonmaker-wachtwoord" type="password" />
                </div>
                <Button className="w-full">{t('homeRegistration.registerAsCleaner')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default HomeRegistration;