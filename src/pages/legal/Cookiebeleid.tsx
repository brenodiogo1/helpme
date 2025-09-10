import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Cookiebeleid = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Cookiebeleid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>HelpMe gebruikt cookies om de website te verbeteren. We gebruiken functionele, analytische en marketingcookies. Door onze site te gebruiken, gaat u akkoord met ons cookiebeleid.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cookiebeleid;