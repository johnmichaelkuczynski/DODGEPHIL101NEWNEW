import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Production static file serving
function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, "../client/dist");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));
  
  // Fall through to index.html if the file doesn't exist (SPA routing)
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

const app = express();

// Environment checking for production deployment
const requiredEnvVars = ['DATABASE_URL'];
const optionalEnvVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

if (missingOptionalVars.length > 0) {
  console.warn('Missing optional environment variables (some features may be disabled):', missingOptionalVars);
}

// Production environment validation
if (process.env.NODE_ENV === 'production') {
  console.log('Production environment detected - performing additional checks...');
  
  // Verify build directory exists in production
  if (!fs.existsSync(path.resolve(__dirname, 'public'))) {
    console.error('Production build not found. Run "npm run build" before deployment.');
    process.exit(1);
  }
  
  console.log('Production environment checks passed');
}

// Health check endpoint for deployment platforms
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Quick health status response
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      version: '1.0.0'
    };

    // Optionally test database connection if in production
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      try {
        const { storage } = await import('./storage.js');
        await storage.testConnection();
        healthStatus.database = 'connected';
      } catch (error) {
        healthStatus.database = 'disconnected';
        console.warn('Health check: Database connection failed', error);
      }
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// Basic readiness check - simple and fast
app.get('/ready', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Database initialization function
const initializeDatabase = async () => {
  try {
    console.log('Testing database connection...');
    
    // Only test database connection if DATABASE_URL is provided
    if (!process.env.DATABASE_URL) {
      if (process.env.NODE_ENV === 'production') {
        console.error('DATABASE_URL environment variable is required in production');
        process.exit(1);
      }
      console.warn('No DATABASE_URL provided - using memory storage');
      return false;
    }
    
    const { storage } = await import('./storage.js');
    await storage.testConnection();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('Database connection is required in production');
      console.error('Ensure DATABASE_URL environment variable is set correctly');
      process.exit(1);
    }
    // In development, continue without database if connection fails
    console.warn('Continuing without database connection in development mode');
    return false;
  }
};

(async () => {
  // Initialize database connection
  await initializeDatabase();
  
  const server = await registerRoutes(app);

  // Enhanced error handling for production deployment
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details in production for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('Server Error:', {
        status,
        message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    }

    res.status(status).json({ 
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
    
    // Don't throw error in production to prevent server crash
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
  });

  // Setup development vs production serving
  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import Vite only in development - esbuild will tree-shake this in production
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Configure port for both development and production
  // Use PORT environment variable in production (Cloud Run), fallback to 5000
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = '0.0.0.0'; // Ensure accessible binding for Cloud Run
  
  // Enhanced server initialization with proper error handling
  const startServer = () => {
    console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
    console.log(`Port: ${port}, Host: ${host}`);
    console.log(`Database URL configured: ${!!process.env.DATABASE_URL}`);
    console.log(`Session secret configured: ${!!process.env.SESSION_SECRET}`);
    return new Promise<void>((resolve, reject) => {
      const serverInstance = server.listen({
        port,
        host,
        reusePort: true,
      }, () => {
        log(`Server successfully started on ${host}:${port}`);
        log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        resolve();
      });

      serverInstance.on('error', (error: any) => {
        console.error('Server failed to start:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use`);
        }
        reject(error);
      });
    });
  };

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    log(`Received ${signal}, shutting down gracefully`);
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      log('Forcing server shutdown');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Start the server with error handling
  try {
    await startServer();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})().catch((error) => {
  console.error('Application startup failed:', error);
  process.exit(1);
});
