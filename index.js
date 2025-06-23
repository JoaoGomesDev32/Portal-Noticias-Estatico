import express from "express";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/pages"));

app.get("/", (req, res) => {
  if (req.query.busca == null) {
    res.render("home", {});
  } else {
    res.send(`Você buscou: ${req.query.busca}`);
  }
});

app.get("/:slug", (req, res) => {
  res.send(req.params.slug);
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
