import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import LeaveReviewDialog from "@/components/LeaveReviewDialog";
import { Link } from "react-router-dom"; // Import Link

const mockBoekingen = [
    { id: "B101", schoonmaker: "Anna de Vries", schoonmakerPhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop", datum: "2024-05-10", status: "Voltooid", bedrag: 55.50 },
    { id: "B103", schoonmaker: "Carla Bakker", schoonmakerPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop", datum: "2024-05-18", status: "Gepland", bedrag: 80.00 },
    { id: "B105", schoonmaker: "Ben Janssen", schoonmakerPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop", datum: "2024-04-22", status: "Voltooid", bedrag: 51.00 },
];

const CustomerBookings = () => {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedSchoonmaker, setSelectedSchoonmaker] = useState("");

  const handleOpenReviewDialog = (schoonmakerName: string) => {
    setSelectedSchoonmaker(schoonmakerName);
    setIsReviewDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mijn Boekingen</CardTitle>
          <CardDescription>
            Bekijk hier je boekingsgeschiedenis en aankomende afspraken.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schoonmaker</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBoekingen.map((boeking) => (
                <TableRow key={boeking.id}>
                  <TableCell className="font-medium">{boeking.schoonmaker}</TableCell>
                  <TableCell>{boeking.datum}</TableCell>
                  <TableCell>
                    <Badge variant={boeking.status === "Voltooid" ? "default" : "secondary"}>
                      {boeking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">€{boeking.bedrag.toFixed(2)}</TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => boeking.status === "Voltooid" && handleOpenReviewDialog(boeking.schoonmaker)}
                      >
                          {boeking.status === "Voltooid" ? "Beoordeling schrijven" : "Beheren"}
                      </Button>
                      {boeking.status === "Gepland" && (
                        <Button asChild variant="secondary" size="sm">
                            <Link to="/account/chat" state={{ cleanerName: boeking.schoonmaker, cleanerAvatar: boeking.schoonmakerPhoto }}>
                                Chat
                            </Link>
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <LeaveReviewDialog 
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        schoonmakerName={selectedSchoonmaker}
      />
    </>
  );
};

export default CustomerBookings;