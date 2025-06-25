import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { INVENTORY_URL } from "@/config";
import { User } from "@prisma/client";

const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    let user: User | null = null;
    const field = req.query.field as string;

    if (field === "authUserId") {
      user = await prisma.user.findUnique({
        where: {
          authUserId: id,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "user item not found",
      });
    }

    // Respond with the inventory item
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export default getUserById;
