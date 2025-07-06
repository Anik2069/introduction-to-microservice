import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { UserLoginSchema } from "@/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@prisma/client";

type LoginHistory = {
  userId: string;
  userAgent: string;
  ip: string;
  attempt: LoginAttempt;
};

const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const ipAddress = req.headers["x-forwarded-for"] as string || req.ip || "";
    const uesrAgent = req.headers["user-agent"] || "";
    const parsedData = UserLoginSchema.safeParse(req.body);

    if (!parsedData.success) {
      // If validation fails, respond with a 400 status and the validation errors
      return res.status(400).json({
        message: "Invalid input data",
        errors: parsedData.error.errors,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parsedData.data.email,
      },
    });
    if (!user) {
      await createLoginHistory(
        {
          userId: "Guest",
          userAgent: uesrAgent,
          ip: ipAddress,
          attempt: "FAILED",
        }
      )
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );

    if (!isMatch) {
      await createLoginHistory(
        {
          userId: user.id,
          userAgent: uesrAgent,
          ip: ipAddress,
          attempt: "FAILED",
        }
      )
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!user.verified) {
      await createLoginHistory(
        {
          userId: user.id,
          userAgent: uesrAgent,
          ip: ipAddress,
          attempt: "FAILED",
        }
      )
      return res.status(401).json({
        message: "User is not Verified",
      });
    }
    if (user.status != "ACTIVE") {
      await createLoginHistory(
        {
          userId: user.id,
          userAgent: uesrAgent,
          ip: ipAddress,
          attempt: "FAILED",
        }
      )
      return res.status(401).json({
        message: "User is not active",
      });
    }


    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );


    await createLoginHistory(
      {
        userId: user.id,
        userAgent: uesrAgent,
        ip: ipAddress,
        attempt: "SUCCESS",
      }
    )

    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: info.userId,
      userAgent: info.userAgent,
      ipAddress: info.ip,
      attempt: info.attempt,
    },
  });
};

export default userLogin;
