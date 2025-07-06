import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/prisma";
import { EmailVerificationSchema } from "@/schema";
import axios from "axios";


const verificationEmail = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const parsedData = EmailVerificationSchema.safeParse(req.body);
        console.log(parsedData);
        if (!parsedData.success) {
            return res.status(400).json({
                message: "Invalid input data",
                errors: parsedData.error.errors,
            });
        }
        const { email, code } = parsedData.data;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const verifyCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code
            }
        })

        if (!verifyCode) {
            return res.status(404).json({
                message: "Verification code not found",
            });
        }

        if (verifyCode.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Verification code expired",
            });
        }
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                verified: true,
                status: "ACTIVE"
            }
        })

        await prisma.verificationCode.update({
            where: {
                id: verifyCode.id
            },
            data: {
                status: "USED",
                verifiedAt: new Date()
            }
        })

        axios.post(`${process.env.EMAIL_SERVICE_URL}/email/send`, {
            recipient: email,
            subject: "Email Verification",
            body: "Your email has been verified successfully",
            source: "Verify Email"
        });


        return res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Internal SERver error", error });
    }

}

export default verificationEmail