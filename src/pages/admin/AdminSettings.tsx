import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminSettings = () => {
  return (
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
  );
};

export default AdminSettings;