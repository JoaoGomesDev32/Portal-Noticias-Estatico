import Post from "../models/Post.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { importGuardianNews } from "../services/importGuardian.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed mínimo de usuário admin (executa on-demand na tela de login)
async function ensureAdminSeed() {
  const exists = await User.findOne({ email: "admin@jsnews.dev" });
  if (!exists) {
    const passwordHash = await bcrypt.hash("123456", 10);
    await User.create({
      email: "admin@jsnews.dev",
      name: "Administrador",
      passwordHash,
    });
  }
}

export const getLogin = (req, res) => {
  if (req.session.login == null) {
    res.render("admin-login", { mensagem: null });
  } else {
    res.redirect("/admin/panel");
  }
};

export const postLogin = (req, res) => {
  return (async () => {
    try {
      await ensureAdminSeed();
      const { login, senha } = req.body;
      const user = await User.findOne({ email: login });
      if (!user) {
        return res.render("admin-login", { mensagem: "Login ou senha inválidos!" });
      }
      const ok = await bcrypt.compare(senha, user.passwordHash);
      if (!ok) {
        return res.render("admin-login", { mensagem: "Login ou senha inválidos!" });
      }
      req.session.login = user.email;
      req.session.userName = user.name;
      return res.redirect("/admin/panel");
    } catch (e) {
      return res.render("admin-login", { mensagem: "Erro ao autenticar." });
    }
  })();
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
    if (req.files && req.files.arquivo && req.files.arquivo.size > 0) {
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

    // Normalizar caminho de imagem: aceitar URLs http(s) ou caminho local relativo
    if (imagemPath && !/^https?:\/\//i.test(imagemPath)) {
      // se não começar com http, garantir prefixo /public/uploads/
      if (!imagemPath.startsWith("/public/")) {
        imagemPath = "/public/uploads/" + imagemPath.replace(/^\/+/, "");
      }
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
      autor: req.session.userName || req.session.login,
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

// Importar notícias do Guardian
export const postImportar = async (req, res) => {
  if (!req.session.login) {
    return res.redirect("/admin/login");
  }
  
  try {
    const result = await importGuardianNews();
    const posts = await Post.find({}).sort({ createdAt: -1 });
    
    res.render("admin-panel", {
      login: req.session.login,
      posts,
      mensagem: `Importação concluída: ${result.imported} novos, ${result.updated} atualizados`,
    });
  } catch (error) {
    console.error("Erro na importação:", error);
    const posts = await Post.find({}).sort({ createdAt: -1 });
    
    res.render("admin-panel", {
      login: req.session.login,
      posts,
      mensagem: `Erro na importação: ${error.message}`,
    });
  }
}; 