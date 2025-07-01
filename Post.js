import mongoose from "mongoose";
import { Schema } from "mongoose";

const postSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    imagem: {
      type: String,
      required: true,
    },
    categoria: {
      type: String,
      required: true,
    },
    conteudo: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    autor: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { collection: "noticias" }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
