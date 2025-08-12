import Post from "../models/Post.js";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usuarios = [
  { login: "joao@email.com", senha: "123456" },
  { login: "denize@email.com", senha: "123456" },
];

export const getLogin = (req, res) => {
  if (req.session.login == null) {
    res.render("admin-login", { mensagem: null });
  } else {
    res.redirect("/admin/panel");
  }
};

export const postLogin = (req, res) => {
  const usuario = usuarios.find(
    (u) => u.login === req.body.login && u.senha === req.body.senha
  );
  if (usuario) {
    req.session.login = usuario.login;
    res.redirect("/admin/panel");
  } else {
    res.render("admin-login", { mensagem: "Login ou senha inválidos!" });
  }
};

export const getPanel = async (req, res) => {
  if (!req.session.login) {
    return res.redirect("/admin/login");
  }
  const posts = await Post.find({}).sort({ createdAt: -1 });
  res.render("admin-panel", { login: req.session.login, posts, mensagem: null });
};

export const postCadastro = async (req, res) => {
  if (!req.session.login) {
    return res.redirect("/admin/login");
  }
  try {
    const titulo = (req.body.titulo_noticia || "").trim();
    const categoria = (req.body.categoria || "Nenhuma").trim() || "Nenhuma";
    const conteudo = (req.body.noticia || "").trim();
    const slugInput = (req.body.slug || "").trim();
    let imagemPath = (req.body.url_imagem || "").trim();

    // Upload de arquivo opcional
    if (req.files && req.files.arquivo) {
      const arquivo = req.files.arquivo;
      const uploadsDir = path.join(__dirname, "..", "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const safeName = Date.now() + "-" + arquivo.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const uploadPath = path.join(uploadsDir, safeName);
      await arquivo.mv(uploadPath);
      imagemPath = "/public/uploads/" + safeName;
    }

    if (!titulo || !imagemPath || !conteudo) {
      return res.render("admin-panel", {
        login: req.session.login,
        posts: await Post.find({}),
        mensagem: "Todos os campos são obrigatórios!",
      });
    }

    const slugFinal = slugInput || slugify(titulo, { lower: true, strict: true });

    const novoPost = await Post.create({
      titulo,
      imagem: imagemPath,
      categoria,
      conteudo,
      slug: slugFinal,
      autor: req.session.login,
      views: 0,
    });
    res.redirect("/admin/panel");
  } catch (err) {
    res.render("admin-panel", {
      login: req.session.login,
      posts: await Post.find({}),
      mensagem: "Erro ao cadastrar post: " + err.message,
    });
  }
};

export const getDeletar = async (req, res) => {
  if (!req.session.login) {
    return res.redirect("/admin/login");
  }
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/admin/panel");
  } catch (err) {
    res.render("admin-panel", { login: req.session.login, posts: await Post.find({}), mensagem: "Erro ao deletar post." });
  }
};

export const getLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
}; 