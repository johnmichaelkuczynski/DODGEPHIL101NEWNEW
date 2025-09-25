import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 5000;

if (process.env.NODE_ENV !== "production") {
  // Dev mode: use Vite
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 5001,
        }
      },
    });
    app.use(vite.middlewares);

    app.listen(port, "0.0.0.0", () => {
      console.log(`Dev server running at http://0.0.0.0:${port}`);
    });
  });
} else {
  // Prod mode: serve built client
  const clientDist = path.resolve(__dirname, "../dist/public");
  app.use(express.static(clientDist));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`Prod server running at http://0.0.0.0:${port}`);
  });
}