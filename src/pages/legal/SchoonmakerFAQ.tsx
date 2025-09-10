import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
    {
        question: "Hoe word ik schoonmaker bij HelpMe?",
        answer: "Meld je aan via de website, voltooi je profiel en na een screening kun je aan de slag."
    },
    {
        question: "Hoeveel kan ik verdienen?",
        answer: "Je bepaalt je eigen uurtarief. HelpMe rekent een kleine service fee over elke boeking."
    },
    {
        question: "Wanneer word ik uitbetaald?",
        answer: "Uitbetalingen vinden wekelijks plaats, direct op je bankrekening."
    }
];

const SchoonmakerFAQ = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">FAQ voor Schoonmakers</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoonmakerFAQ;