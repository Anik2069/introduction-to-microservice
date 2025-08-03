import { CART_TTL, INVENTORY_SERVICE_URL } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schemas";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

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
      }
    }

    if (cartSessionId === null) {
      cartSessionId = uuid();

      console.log("Creating new cart session ID:", cartSessionId);

      await redis.setex(`session:${cartSessionId}`, CART_TTL, cartSessionId);

      res.setHeader("x-cart-session-id", cartSessionId);
    }

    // check if the inventory is available
    const { data } = await axios.get(
      `${INVENTORY_SERVICE_URL}/inventories/${parseBody.data.inventoryId}`
    );

    if (Number(data.quantity) < parseBody.data.quantity) {
      return res.status(400).json({
        message: "Insufficient inventory for the requested item",
      });
    }

    // Add item to cart

    await redis.hset(
      `cart:${cartSessionId}`,
      parseBody.data.productId,
      JSON.stringify({
        inventoryId: parseBody.data.inventoryId,
        quantity: parseBody.data.quantity,
      })
    );

    await axios.put(
      `${INVENTORY_SERVICE_URL}/inventories/${parseBody.data.inventoryId}`,
      {
        quantity: parseBody.data.quantity,
        actionType: "Out",
      }
    );

    return res.status(200).json({
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export default addToCart;
