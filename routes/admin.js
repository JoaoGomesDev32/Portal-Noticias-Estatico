import express from "express";
import {
  getLogin,
  postLogin,
  getPanel,
  postCadastro,
  getDeletar,
  getLogout
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/panel", getPanel);
router.post("/cadastro", postCadastro);
router.post("/deletar/:id", getDeletar);
router.get("/logout", getLogout);

// Editar Post
import { getEditar, postEditar } from "../controllers/postController.js";
router.get("/editar/:id", getEditar);
router.post("/editar/:id", postEditar);

export default router; 