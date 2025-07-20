import { Express, Request, Response } from "express";
import services from "./config.json";
import axios from "axios";
import middlewares from "./middleware";

export const configureRoutes = (app: Express) => {
  Object.entries(services.services).forEach(([name, service]) => {
    const hostname = service.url;
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const middleware = getMiddlewares(route.middlewares);
        const handler = createHandler(method, route.path, hostname);
        console.log(`/api${route.path}`, middleware);
        app[method](`/api${route.path}`, middleware, handler);
      });
    });
    // const hostname = services.url;
  });
};

const getMiddlewares = (names: string[]) => {
  return names.map((name) => middlewares[name]);
};

export const createHandler = (
  method: string,
  path: string,
  hostname: string
) => {
  //closure
  return async (req: Request, res: Response) => {
    try {
      let url = `${hostname}${path}`;
      req.params &&
        Object.keys(req.params).forEach((param) => {
          url = url.replace(`:${param}`, req.params[param]);
        });
      const { data } = await axios({
        method,
        url: url,
        data: req.body,
        headers: {
          origin: "http://localhost:8081",
          "x-user-id": req.headers["x-user-id"],
          "x-user-email": req.headers["x-user-email"],
          "x-user-name": req.headers["x-user-name"],
          "x-user-role": req.headers["x-user-role"],
          "user-agent": req.headers["user-agent"],
        },
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
