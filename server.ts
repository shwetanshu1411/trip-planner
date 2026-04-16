import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Trip } from "./src/models/Trip.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    // Basic validation of URI format
    if (!MONGODB_URI.startsWith("mongodb+srv://") && !MONGODB_URI.startsWith("mongodb://")) {
      console.error("❌ Invalid MONGODB_URI format. It should start with 'mongodb+srv://' or 'mongodb://'");
    }

    mongoose.connect(MONGODB_URI)
      .then(() => console.log("✅ Connected to MongoDB"))
      .catch(err => {
        console.error("❌ MongoDB connection error:");
        const msg = err.message || "";
        
        if (msg.includes("Authentication failed") || msg.includes("bad auth")) {
          console.error("   Reason: Invalid username or password in MONGODB_URI.");
          console.error("   Tip: If your password has special characters (@, :, /), you must URL-encode them.");
        } else if (msg.includes("HandshakeError") || msg.includes("ETIMEDOUT")) {
          console.error("   Reason: Network timeout/Handshake error.");
          console.error("   Tip: Ensure your IP (0.0.0.0/0) is allowed in MongoDB Atlas 'Network Access'.");
        } else if (msg.includes("ENOTFOUND")) {
          console.error("   Reason: Database host not found. Check your MONGODB_URI for typos.");
        } else {
          console.error(`   ${msg}`);
        }
      });
  } else {
    console.warn("⚠️ MONGODB_URI not found in environment variables. Database features will be disabled.");
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/status", (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    res.json({
      mongodb: statusMap[dbStatus as keyof typeof statusMap] || "unknown",
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasClerkKey: !!process.env.VITE_CLERK_PUBLISHABLE_KEY,
        hasMapboxToken: !!process.env.VITE_MAPBOX_ACCESS_TOKEN,
      }
    });
  });

  // Trip API Routes
  app.post("/api/trips", async (req, res) => {
    try {
      const trip = new Trip(req.body);
      await trip.save();
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error saving trip:", error);
      res.status(500).json({ error: "Failed to save trip" });
    }
  });

  app.get("/api/trips/:userId", async (req, res) => {
    try {
      const trips = await Trip.find({ userId: req.params.userId }).sort({ createdAt: -1 });
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.delete("/api/trips/:id", async (req, res) => {
    try {
      await Trip.findByIdAndDelete(req.params.id);
      res.json({ message: "Trip deleted" });
    } catch (error) {
      console.error("Error deleting trip:", error);
      res.status(500).json({ error: "Failed to delete trip" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
