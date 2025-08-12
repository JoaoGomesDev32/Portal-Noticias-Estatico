import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import Post from "./models/Post.js";
import session from "express-session";
import helmet from "helmet";
import compression from "compression";
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

// Segurança e performance
app.use(helmet());
app.use(compression());

app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
  })
);

app.use(
  session({
    name: "jsnews.sid",
    secret: process.env.SESSION_SECRET || "change-me-in-.env",
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // 2h
      httpOnly: true,
      sameSite: "lax",
      secure: false, // defina true quando estiver atrás de HTTPS
    },
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/views"));

// Garante que a pasta de uploads exista
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/", postRoutes);
app.use("/admin", adminRoutes);

// As rotas /admin e / são tratadas pelos respectivos arquivos em /routes

// 404 handler
app.use((req, res) => {
  res.status(404).send("Página não encontrada");
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
