import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { UserCreateDTOSchema } from "@/schema";
import { INVENTORY_URL } from "@/config";

const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Validate the input data against the schema
    const parsedData = UserCreateDTOSchema.safeParse(req.body);
    console.log(parsedData)
    if (!parsedData.success) {
      // If validation fails, respond with a 400 status and the validation errors
      return res.status(400).json({
        message: "Invalid input data",
        errors: parsedData.error.errors,
      });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        authUserId: parsedData.data.authUserId,
      },
    });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }
    // Create a new inventory item in the database
    const newUser = await prisma.user.create({
      data: parsedData.data,
    });

    res.status(201).json(newUser);

    return;
  } catch (error) {
    next(error);
    return;
  }
};

export default createUser;
