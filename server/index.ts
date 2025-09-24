import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  // Dev mode: use Vite
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);

    app.listen(port, () => {
      console.log(`Dev server running at http://localhost:${port}`);
    });
  });
} else {
  // Prod mode: serve built client
  const clientDist = path.resolve(__dirname, "../dist/public");
  app.use(express.static(clientDist));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  app.listen(port, () => {
    console.log(`Prod server running at http://localhost:${port}`);
  });
}