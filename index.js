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
import cron from "node-cron";
import { importGuardianNews } from "./services/importGuardian.js";

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

// Cron job para importação automática (a cada 30 minutos)
if (process.env.GUARDIAN_API_KEY) {
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('Executando importação automática...');
      const result = await importGuardianNews();
      console.log(`Importação automática concluída: ${result.imported} novos, ${result.updated} atualizados`);
    } catch (error) {
      console.error('Erro na importação automática:', error.message);
    }
  });
  console.log('Cron job de importação configurado (a cada 30 minutos)');
} else {
  console.log('GUARDIAN_API_KEY não configurada - importação automática desabilitada');
}

app.use("/", postRoutes);
app.use("/admin", adminRoutes);

// As rotas /admin e / são tratadas pelos respectivos arquivos em /routes

// SEO: robots.txt e sitemap.xml simples
app.get("/robots.txt", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`);
});
app.get("/sitemap.xml", async (req, res) => {
  try {
    const posts = await Post.find({}).select("slug updatedAt").sort({ updatedAt: -1 });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const urls = posts
      .map((p) => `<url><loc>${baseUrl}/${p.slug}</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod></url>`) 
      .join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc></url>${urls}</urlset>`;
    res.type("application/xml").send(xml);
  } catch (e) {
    res.type("application/xml").send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>");
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("Página não encontrada");
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
