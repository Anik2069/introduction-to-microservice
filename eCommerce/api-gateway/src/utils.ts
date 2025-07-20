import { Express, Request, Response } from "express";
import services from "./config.json";
import axios from "axios";

export const configureRoutes = (app: Express) => {
  Object.entries(services.services).forEach(([name, service]) => {
    const hostname = service.url;
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(method, route.path, hostname);
        console.log(`/api${route.path}`);
        app[method](`/api${route.path}`, handler);
      });
    });
    // const hostname = services.url;
  });
};

const concateMiddlewares = (middlewares: string[]) => {
  return middlewares.join(",");
};

export const createHandler = (
  method: string,
  path: string,
  hostname: string
) => {
  //closure
  return async (req: Request, res: Response) => {
    try {
      const { data } = await axios({
        method,
        url: `${hostname}${path}`,
        data: req.body,
      });

      return res.json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        return res
          .status(error.response?.status || 500)
          .json(error.response?.data);
      }
      console.log(error, "Asss");
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
