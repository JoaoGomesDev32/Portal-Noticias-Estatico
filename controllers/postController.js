import Post from "../models/Post.js";
import slugify from "slugify";

export const getHome = async (req, res) => {
  if (!req.query.busca) {
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

      res.render("home", { posts, postsTop, pageTitle: "JS News - Início", pageDescription: "Últimas notícias e mais lidas" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar posts");
    }
  } else {
    return getSearch(req, res);
  }
};

export const getSearch = async (req, res) => {
  try {
    const posts = await Post.find({
      titulo: { $regex: req.query.busca, $options: "i" },
    })
      .sort({ views: -1 })
      .exec();

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
      pageTitle: `Resultado da busca (${postsMapped.length}) - JS News`,
      pageDescription: `Resultados para ${req.query.busca}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar posts");
  }
};

export const getSingle = async (req, res) => {
  try {
    const resposta = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!resposta) {
      return res.status(404).send("Notícia não encontrada");
    }

    const postsTop = await Post.find({}).sort({ views: -1 }).limit(5).exec();
    const postsTopMapped = postsTop.map((post) => ({
      titulo: post.titulo,
      descricaoCurta: post.conteudo.substring(0, 100) + "...",
      imagem: post.imagem,
      slug: post.slug,
    }));

    res.render("single", {
      noticia: resposta,
      postsTop: postsTopMapped,
      pageTitle: `${resposta.titulo} - JS News`,
      pageDescription: resposta.conteudo.substring(0, 150),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
}; 

// Admin: editar
export const getEditar = async (req, res) => {
  if (!req.session || !req.session.login) {
    return res.redirect("/admin/login");
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post não encontrado");
    const posts = await Post.find({}).sort({ createdAt: -1 });
    return res.render("admin-panel", {
      login: req.session.login,
      posts,
      mensagem: null,
      editar: post,
    });
  } catch (e) {
    return res.status(500).send("Erro ao carregar edição");
  }
};

export const postEditar = async (req, res) => {
  if (!req.session || !req.session.login) {
    return res.redirect("/admin/login");
  }
  try {
    const { titulo_noticia, categoria, noticia, slug } = req.body;
    const updates = {
      titulo: titulo_noticia,
      categoria: categoria || "Nenhuma",
      conteudo: noticia,
    };
    if (slug && slug.trim()) {
      updates.slug = slugify(slug, { lower: true, strict: true });
    }
    await Post.findByIdAndUpdate(req.params.id, updates);
    return res.redirect("/admin/panel");
  } catch (e) {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    return res.render("admin-panel", {
      login: req.session.login,
      posts,
      mensagem: "Erro ao editar post",
    });
  }
};