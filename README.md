# HelpMe - Plataforma de Agendamento de Limpeza

HelpMe é uma plataforma web moderna projetada para conectar clientes a faxineiros profissionais de forma fácil e eficiente. A aplicação oferece painéis de controle distintos para clientes, faxineiros e administradores, cada um com funcionalidades específicas para suas necessidades.

## ✨ Principais Funcionalidades

-   **Busca e Filtragem:** Encontre faxineiros com base na localização, preço e serviços.
-   **Perfis Detalhados:** Veja perfis completos dos faxineiros, incluindo biografia, avaliações e serviços oferecidos.
-   **Agendamento Simplificado:** Agende um serviço de limpeza em poucos cliques.
-   **Painéis de Controle Dedicados:**
    -   **Cliente:** Gerencie agendamentos, visualize o histórico e atualize o perfil.
    -   **Faxineiro:** Gerencie a disponibilidade, visualize os próximos serviços e edite o perfil público.
    -   **Administrador:** Tenha uma visão geral da plataforma, gerencie usuários e agendamentos.
-   **Suporte a Múltiplos Idiomas:** A interface está preparada para ser traduzida para vários idiomas.

## 🚀 Tecnologias Utilizadas

-   **Frontend:** React, TypeScript, Vite
-   **Estilização:** Tailwind CSS
-   **Componentes UI:** shadcn/ui
-   **Roteamento:** React Router
-   **Gerenciamento de Formulários:** React Hook Form, Zod
-   **Notificações:** Sonner

## 📦 Instalação e Configuração Local

Para executar este projeto em seu ambiente de desenvolvimento local, siga os passos abaixo.

### Pré-requisitos

-   Node.js (versão 18 ou superior)
-   npm (ou pnpm, yarn)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DO_DIRETORIO>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Abra no navegador:**
    Abra seu navegador e acesse `http://localhost:8080` (ou a porta indicada no seu terminal).

## scripts-disponiveis Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento com Hot Module Replacement (HMR).
-   `npm run build`: Compila a aplicação para produção na pasta `dist`.
-   `npm run lint`: Executa o linter (ESLint) para verificar a qualidade do código.
-   `npm run preview`: Inicia um servidor local para visualizar a versão de produção (após executar `npm run build`).