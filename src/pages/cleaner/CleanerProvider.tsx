import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

const CleanerProvider = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Provedor</CardTitle>
        <CardDescription>
          Gerencie as informações e configurações relacionadas ao seu provedor de serviços.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Esta seção é dedicada à gestão do seu perfil como provedor de serviços.
          Aqui você poderá adicionar e gerenciar os serviços que oferece,
          configurar sua área de atuação e outras informações relevantes para clientes.
        </p>
        <Button asChild>
          <Link to="/dashboard/profiel">
            <PlusCircle className="mr-2 h-4 w-4" />
            Atualizar Perfil de Provedor
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CleanerProvider;