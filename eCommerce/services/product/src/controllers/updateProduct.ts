import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { ProductUpdateDTOSchema } from "@/schema";

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Validate the input data against the schema
    const { id } = req.params;
    const inventory = await prisma.product.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        price: true,
      },
    });

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    const parsedData = ProductUpdateDTOSchema.safeParse(req.body);

    if (!parsedData.success) {
      // If validation fails, respond with a 400 status and the validation errors
      return res.status(400).json({
        message: "Invalid input data",
        errors: parsedData.error.errors,
      });
    }

    // Update the inventory item in the database
    const updatedProduct = await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: parsedData.data,
    });

    // Respond with the updated inventory item
    res.status(200).json(updatedProduct);

    return;
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};

export default updateProduct;
