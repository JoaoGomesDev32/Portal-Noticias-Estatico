import Post from "../models/Post.js";

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
    if (!req.body.titulo_noticia || !req.body.url_imagem || !req.body.noticia || !req.body.slug) {
      return res.render("admin-panel", { login: req.session.login, posts: await Post.find({}), mensagem: "Todos os campos são obrigatórios!" });
    }
    const novoPost = await Post.create({
      titulo: req.body.titulo_noticia,
      imagem: req.body.url_imagem,
      categoria: "Nenhuma",
      conteudo: req.body.noticia,
      slug: req.body.slug,
      autor: req.session.login,
      views: 0,
    });
    res.redirect("/admin/panel");
  } catch (err) {
    res.render("admin-panel", { login: req.session.login, posts: await Post.find({}), mensagem: "Erro ao cadastrar post: " + err.message });
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