# Portal de Notícias JS News

Portal de notícias com sistema de administração e importação automática de conteúdo.

## 🚀 Funcionalidades

- **Sistema de Notícias**: CRUD completo de posts com categorias
- **Admin Panel**: Interface para gerenciar conteúdo
- **Importação Automática**: Integração com The Guardian API
- **SEO**: Meta tags dinâmicas, sitemap.xml e robots.txt
- **Responsivo**: Design moderno e mobile-first

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB
- Conta no [The Guardian Open Platform](https://open-platform.theguardian.com/)

## ⚙️ Configuração

1. **Clone o repositório**
```bash
git clone <seu-repo>
cd Portal-Noticias-Estatico
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz:
```env
MONGODB_URI=mongodb://localhost:27017/portal_noticias
SESSION_SECRET=sua-chave-secreta-aqui
GUARDIAN_API_KEY=sua-chave-api-do-guardian
```

4. **Obtenha sua API Key do Guardian**
- Acesse [The Guardian Open Platform](https://open-platform.theguardian.com/)
- Crie uma conta gratuita
- Solicite uma API key
- Adicione no `.env`

## 🚀 Executando

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará disponível em `http://localhost:5000`

## 🔐 Acesso Admin

- **URL**: `/admin/login`
- **Usuário padrão**: `admin@jsnews.dev`
- **Senha**: `123456`

## 📰 Importação Automática

### Manual
- Acesse o painel admin
- Clique em "Importar Notícias" para buscar conteúdo do Guardian

### Automática
- O sistema executa importação a cada 30 minutos automaticamente
- Logs aparecem no console do servidor

## 📁 Estrutura do Projeto

```
├── controllers/          # Lógica de negócio
├── models/              # Modelos MongoDB
├── routes/              # Rotas da aplicação
├── services/            # Serviços externos (API)
├── views/               # Templates EJS
├── public/              # Arquivos estáticos
└── index.js             # Servidor principal
```

## 🔧 Tecnologias

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: EJS, CSS3
- **APIs**: The Guardian Open Platform
- **Segurança**: Helmet, bcryptjs
- **Performance**: Compression

## 📝 Licença

Este projeto é para uso educacional e portfolio. Respeite os termos de uso da API do Guardian.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request 