import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import Post from "./models/Post.js";
import session from "express-session";
import dotenv from "dotenv";
import postRoutes from "./routes/post.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "keyboard cat",
    cookie: { maxAge: 60000 },
    resave: false, // não salva a sessão se nada mudou
    saveUninitialized: false, // não cria sessão até algo ser salvo
  })
);

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/pages"));

app.use("/", postRoutes);
app.use("/admin", adminRoutes);

var usuarios = [
  { login: "joao@email.com", senha: "123456" },
  { login: "denize@email.com", senha: "123456" },
];

app.post("/admin/login", (req, res) => {
  usuarios.map((usuario) => {
    if (usuario.login === req.body.login && usuario.senha === req.body.senha) {
      req.session.login = usuario.login;
    }
  });
  res.redirect("/admin/login");
});

app.post("/admin/cadastro", async (req, res) => {
  console.log("Recebido no cadastro:", req.body);
  try {
    // Checagem dos campos obrigatórios
    if (
      !req.body.titulo_noticia ||
      !req.body.url_imagem ||
      !req.body.noticia ||
      !req.body.slug
    ) {
      return res.status(400).send("Todos os campos são obrigatórios!");
    }
    const novoPost = await Post.create({
      titulo: req.body.titulo_noticia,
      imagem: req.body.url_imagem,
      categoria: "Nenhuma",
      conteudo: req.body.noticia,
      slug: req.body.slug,
      autor: "Admin",
      views: 0,
    });
    console.log("Post cadastrado:", novoPost);
    res.send("Post cadastrado com sucesso!");
  } catch (err) {
    console.error("Erro ao cadastrar post:", err);
    res.status(500).send("Erro ao cadastrar post: " + err.message);
  }
});

app.get("/admin/deletar/:id", (req, res) => {
  res.send("Deletando a notícia com id: " + req.params.id);
});

app.get("/admin/login", (req, res) => {
  if (req.session.login == null) {
    res.render("admin-login");
  } else {
    res.render("admin-panel", {
      login: req.session.login,
      posts: [],
      mensagem: "Você já está logado!",
    });
  }
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
