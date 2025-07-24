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
import fileupload from "express-fileupload";
import fs from "fs";

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
  fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
  })
);

app.use(
  session({
    secret: "keyboard cat",
    cookie: { maxAge: 60000 },
    resave: false, // não salva a sessão se nada mudou
    saveUninitialized: false, // não cria sessão até algo ser salvo
  })
);

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/views"));

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
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  let imagemPath = req.body.url_imagem; // padrão: usa o campo de texto

  // Se um arquivo foi enviado, salve ele na pasta public/uploads
  if (req.files && req.files.arquivo) {
    const arquivo = req.files.arquivo;
    const uploadPath = path.join(__dirname, "public", "uploads", arquivo.name);

    // Crie a pasta uploads se não existir
    if (!fs.existsSync(path.join(__dirname, "public", "uploads"))) {
      fs.mkdirSync(path.join(__dirname, "public", "uploads"));
    }

    // Mova o arquivo para a pasta uploads
    await arquivo.mv(uploadPath);

    // Salve o caminho relativo para usar na aplicação
    imagemPath = "/public/uploads/" + arquivo.name;
    console.log("Arquivo salvo em:", uploadPath);
  } else {
    console.log("Nenhum arquivo recebido.");
  }

  console.log("Recebido no cadastro:", req.body);
  try {
    // Checagem dos campos obrigatórios
    if (
      !req.body.titulo_noticia ||
      !imagemPath ||
      !req.body.noticia ||
      !req.body.slug
    ) {
      return res.status(400).send("Todos os campos são obrigatórios!");
    }
    const novoPost = await Post.create({
      titulo: req.body.titulo_noticia,
      imagem: imagemPath, // agora pode ser o link ou o arquivo enviado
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
