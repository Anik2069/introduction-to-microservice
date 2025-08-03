import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const getMyCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (!cartSessionId) {
      return res.status(400).json({
        message: "Cart session ID is required",
      });
    }

    const session = await redis.exists(`session:${cartSessionId}`);
    if (!session) {
      await redis.del(`session:${cartSessionId}`);
      return res.status(404).json({
        message: "Cart session not found",
      });
    }

    const cartItems = await redis.hgetall(`cart:${cartSessionId}`);

    return res.status(200).json({ data: cartItems });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getMyCart;
