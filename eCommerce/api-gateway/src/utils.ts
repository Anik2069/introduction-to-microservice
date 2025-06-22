import { Express } from "express";
import config from "./config.json";

export const configureRoutes = (app: Express) => {
  Object.entries(config.services).forEach(([key, value]) => {});
};
