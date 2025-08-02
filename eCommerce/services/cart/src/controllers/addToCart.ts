import redis from "@/redis";
import { CartItemSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";

const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const parseBody = CartItemSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: parseBody.error.errors,
      });
    }

    let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (!cartSessionId) {
      const exist = await redis.exists(`session:${cartSessionId}`);
      console.log("Session exists:", exist);
      if (!exist) {
        cartSessionId = null;
        await redis.set(
          `session:${cartSessionId}`,
          JSON.stringify([]),
          "EX",
          3600
        ); // Set session with 1 hour expiration
      }
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export default addToCart;
