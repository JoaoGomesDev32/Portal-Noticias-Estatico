import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import Post from "./models/Post.js";
import session from "express-session";
import dotenv from "dotenv";

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

app.get("/", async (req, res) => {
  if (req.query.busca == null) {
    try {
      let posts = await Post.find({}).sort({ createdAt: -1 }).limit(3).exec();
      let postsTop = await Post.find({}).sort({ views: -1 }).limit(5).exec();

      posts = posts.map((post) => ({
        titulo: post.titulo,
        conteudo: post.conteudo,
        descricaoCurta: post.conteudo.substring(0, 100) + "...",
        imagem: post.imagem,
        slug: post.slug,
        categoria: post.categoria,
      }));

      postsTop = postsTop.map((post) => ({
        titulo: post.titulo,
        descricaoCurta: post.conteudo.substring(0, 100) + "...",
        imagem: post.imagem,
        slug: post.slug,
      }));

      res.render("admin-panel", { posts, postsTop });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar posts");
    }
  } else {
    try {
      const posts = await Post.find({
        titulo: { $regex: req.query.busca, $options: "i" },
      })
        .sort({ views: -1 })
        .exec();

      // Mapear os posts para o formato usado no template
      const postsMapped = posts.map((post) => ({
        titulo: post.titulo,
        conteudo: post.conteudo,
        descricaoCurta: post.conteudo.substring(0, 100) + "...",
        imagem: post.imagem,
        slug: post.slug,
        categoria: post.categoria,
      }));

      res.render("search", {
        posts: postsMapped,
        postCount: postsMapped.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar posts");
    }
  }
});

app.get("/:slug", async (req, res) => {
  try {
    const resposta = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!resposta) {
      return res.status(404).send("Notícia não encontrada");
    }

    // Buscar as mais lidas
    const postsTop = await Post.find({}).sort({ views: -1 }).limit(5).exec();

    // Mapear para o formato usado no template
    const postsTopMapped = postsTop.map((post) => ({
      titulo: post.titulo,
      descricaoCurta: post.conteudo.substring(0, 100) + "...",
      imagem: post.imagem,
      slug: post.slug,
    }));

    res.render("single", { noticia: resposta, postsTop: postsTopMapped });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
});

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
