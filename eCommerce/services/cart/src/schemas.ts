import { z } from "zod";

export const CartItemSchema = z.object({
  productId: z.string(),
  inventory_id: z.string(),
  quantity: z.number().int().positive(),
});
