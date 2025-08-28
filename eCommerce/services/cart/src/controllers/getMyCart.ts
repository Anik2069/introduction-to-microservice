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

    if (Object.keys(cartItems).length === 0) {
      return res.status(200).json({ data: [] });
    }

    const formattedCartItems = Object.entries(cartItems).map(
      ([productId, item]) => {
        const { quantity, inventoryId } = JSON.parse(item) as {
          inventoryId: string;
          quantity: number;
        };
        return { productId, inventoryId, quantity };
      }
    );

    return res.status(200).json({ data: formattedCartItems });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getMyCart;
