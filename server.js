require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const { bucket } = require("./config/storage");

// Initialize GCS connection
async function initializeStorage() {
  try {
    const [exists] = await bucket.exists();
    console.log("Connected to Google Cloud Storage");
    return true;
  } catch (err) {
    console.error("Failed to connect to Google Cloud Storage:", err);
    return false;
  }
}

// Initialize server
async function startServer() {
  const storageConnected = await initializeStorage();
  if (!storageConnected) {
    process.exit(1);
  }

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://portv2-three.vercel.app",
    "https://www.cduarte.ca",
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    exposedHeaders: ["Authorization"],
    optionsSuccessStatus: 200,
  };

  // Apply CORS before other middleware
  app.use(cors(corsOptions));
  app.use(express.json());

  // Add error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/reviews", require("./routes/reviews"));

  const port = process.env.PORT || 8080;
  const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Closing server.");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
