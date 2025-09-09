# Guia de Implantação em um VPS com Nginx

Este guia descreve os passos para implantar a aplicação React em um servidor VPS (Servidor Privado Virtual) com Ubuntu, utilizando Nginx como servidor web.

## Pré-requisitos

1.  Um VPS com Ubuntu 22.04 (ou outra distribuição Linux).
2.  Acesso SSH ao servidor.
3.  Node.js e npm instalados no servidor.
4.  Um nome de domínio apontado para o endereço IP do seu VPS (opcional, mas recomendado).

---

### Passo 1: Obter o Código da Aplicação

1.  Conecte-se ao seu VPS via SSH.

2.  Clone o repositório do seu projeto para o servidor.
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DO_DIRETORIO>
    ```

---

### Passo 2: Instalar Dependências e Gerar a Build de Produção

1.  Dentro do diretório do projeto, instale as dependências do Node.js.
    ```bash
    npm install
    ```

2.  Execute o script de build para compilar a aplicação. Este comando criará uma pasta `dist` com todos os arquivos estáticos otimizados para produção.
    ```bash
    npm run build
    ```

---

### Passo 3: Instalar e Configurar o Nginx

1.  Instale o Nginx no seu servidor.
    ```bash
    sudo apt update
    sudo apt install nginx
    ```

2.  Crie um novo arquivo de configuração de bloco de servidor (server block) para a sua aplicação. Substitua `seudominio.com` pelo seu domínio ou pelo IP do servidor.
    ```bash
    sudo nano /etc/nginx/sites-available/seudominio.com
    ```

3.  Cole a seguinte configuração no arquivo. **Certifique-se de substituir `/caminho/para/seu/projeto/dist` pelo caminho absoluto para a pasta `dist` da sua aplicação.**

    ```nginx
    server {
        listen 80;
        server_name seudominio.com www.seudominio.com;

        # Caminho para os arquivos da sua aplicação
        root /caminho/para/seu/projeto/dist;
        index index.html;

        location / {
            # Esta linha é crucial para o funcionamento do React Router
            try_files $uri $uri/ /index.html;
        }
    }
    ```
    A diretiva `try_files` garante que todas as rotas sejam gerenciadas pelo React Router, evitando erros 404 ao recarregar a página.

4.  Ative a configuração criando um link simbólico para o diretório `sites-enabled`.
    ```bash
    sudo ln -s /etc/nginx/sites-available/seudominio.com /etc/nginx/sites-enabled/
    ```

5.  Verifique se a sintaxe da configuração do Nginx está correta.
    ```bash
    sudo nginx -t
    ```
    Se tudo estiver OK, você verá uma mensagem de sucesso.

6.  Reinicie o Nginx para aplicar as alterações.
    ```bash
    sudo systemctl restart nginx
    ```

---

### Passo 4: Configurar o Firewall

Se você estiver usando um firewall como o UFW, permita o tráfego HTTP e HTTPS.

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Sua aplicação agora deve estar acessível através do seu domínio ou endereço IP.

---

### (Opcional) Passo 5: Configurar HTTPS com Let's Encrypt

Para proteger sua aplicação com um certificado SSL gratuito, use o Certbot.

1.  Instale o Certbot.
    ```bash
    sudo apt install certbot python3-certbot-nginx
    ```

2.  Obtenha e instale um certificado SSL para o seu domínio.
    ```bash
    sudo certbot --nginx -d seudominio.com -d www.seudominio.com
    ```
    O Certbot irá configurar automaticamente o Nginx para usar HTTPS e redirecionar o tráfego HTTP.

3.  Reinicie o Nginx novamente, se necessário.
    ```bash
    sudo systemctl restart nginx
    ```

Sua aplicação agora está implantada e segura!