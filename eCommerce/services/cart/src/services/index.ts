import redis from "@/redis";

export const clearCart = async (cartId: string) => {
  // Logic to clear the cart
  try {
    const data = await redis.hgetall(`cart:${cartId}`);
    if (Object.keys(data).length === 0) {
      return;
    }

    const items = Object.keys(data).map((key) => {
      const { quantity, inventoryID } = JSON.parse(data[key]) as {
        inventoryID: string;
        quantity: number;
      };
      return { inventoryID, quantity, productID: key };
    });

    return true;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
};
