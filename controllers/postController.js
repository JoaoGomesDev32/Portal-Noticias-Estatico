import Post from "../models/Post.js";

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

      res.render("home", { posts, postsTop });
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

    res.render("single", { noticia: resposta, postsTop: postsTopMapped });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
}; 