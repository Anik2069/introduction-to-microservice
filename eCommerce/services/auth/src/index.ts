// index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { userLogin, userRegistration, verificationEmail, verifyToken } from "./controllers";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// app.put('/inventories/:id', updateInventory);
// app.get("/user/:id", getUserById);
app.post("/registration", userRegistration);
app.post("/login", userLogin);
app.post('/verify-token', verifyToken);
app.post('/verify-email', verificationEmail);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Start server
const port = process.env.PORT || 4004;
const serviceName = process.env.SERVICE_NAME || "inventory-service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});
