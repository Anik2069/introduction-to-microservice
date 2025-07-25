import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { UserCreateDTOSchema } from "@/schema";
import bcrypt from "bcryptjs";
import { EMAIL_SERVICE_URL, USER_SERVICE_URL } from "@/config";
import axios from "axios";
const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Validate the input data against the schema
    const parsedData = UserCreateDTOSchema.safeParse(req.body);
    console.log(parsedData);
    if (!parsedData.success) {
      // If validation fails, respond with a 400 status and the validation errors
      return res.status(400).json({
        message: "Invalid input data",
        errors: parsedData.error.errors,
      });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedData.data.email,
      },
    });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }
    // Create a new inventory item in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedData.data.password, salt);
    const newUser = await prisma.user.create({
      data: {
        ...parsedData.data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true,
      },
    });

    await axios.post(`${USER_SERVICE_URL}/user`, {
      authUserId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
    // generate verification code
    const code = generateVerificationCode();

    await prisma.verificationCode.create({
      data: {
        code,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000 * 24),
      },
    })
    // send verficication email
    await axios.post(`${EMAIL_SERVICE_URL}/email/send`, {
      recipient: newUser.email,
      subject: "Email Verification",
      body: `Your verification code is ${code}`,
      source: "user-registration"

    })

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const generateVerificationCode = () => {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);
  return (timestamp + randomString).slice(-5);
};

export default userRegistration;
