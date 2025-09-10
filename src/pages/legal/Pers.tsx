import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Pers = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Pers & Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Voor persvragen, interviews of beeldmateriaal kunt u contact opnemen met ons persteam via <a href="mailto:pers@helpme.com" className="text-primary underline">pers@helpme.com</a>.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pers;