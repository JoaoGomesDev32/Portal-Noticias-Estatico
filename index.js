import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import Post from "./Post.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

mongoose
  .connect(
    "mongodb+srv://joaogomesdev32:05012022@cluster0.kxlzecc.mongodb.net/portaldenoticias?retryWrites=true&w=majority&appName=Cluster0",
    {}
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/pages"));

app.get("/", async (req, res) => {
  if (req.query.busca == null) {
    try {
      let posts = await Post.find({}).sort({ views: -1 }).limit(3).exec();
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

      res.render("home", { posts, postsTop });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar posts");
    }
  } else {
    res.render("search", {});
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

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
