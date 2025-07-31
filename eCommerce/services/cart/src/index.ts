import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use(helmet());




app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});
// Start server
const port = process.env.PORT || 4006;
const serviceName = process.env.SERVICE_NAME || "Cart-service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});
