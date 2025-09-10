import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
    {
        question: "Hoe werkt het boeken?",
        answer: "U voert uw postcode in, kiest een schoonmaker, selecteert een datum en tijd, en bevestigt uw boeking. Het is zo simpel!"
    },
    {
        question: "Zijn de schoonmakers gescreend?",
        answer: "Ja, alle schoonmakers op ons platform ondergaan een grondige screening, inclusief een persoonlijk gesprek en referentiecheck."
    },
    {
        question: "Wat als ik niet tevreden ben?",
        answer: "Wij bieden een 100% tevredenheidsgarantie. Neem contact op met onze klantenservice en we zoeken samen naar een passende oplossing."
    }
];

const FAQ = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Veelgestelde Vragen (FAQ)</CardTitle>
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

export default FAQ;