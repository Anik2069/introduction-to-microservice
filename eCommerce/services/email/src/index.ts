// index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { getEmails, sendEmail } from "./controllers";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.post('/emails.send', sendEmail);
app.get('/emails', getEmails);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Start server
const port = process.env.PORT || 4005;
const serviceName = process.env.SERVICE_NAME || "Emsil-service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});
