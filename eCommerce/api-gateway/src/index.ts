import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { configureRoutes } from "./utils";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use(helmet());

//config rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res, next) => {
    res.status(429).json({
      message: "Too many requests. Please try again later.",
    });
  },
});

app.use("/api", limiter);

configureRoutes(app);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});
// Start server
const port = process.env.PORT || 4000;
const serviceName = process.env.SERVICE_NAME || "inventory-service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});
