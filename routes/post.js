import express from "express";
import { getHome, getSingle, getSearch } from "../controllers/postController.js";

const router = express.Router();

router.get("/", getHome);
router.get("/search", getSearch);
router.get("/:slug", getSingle);

export default router; 