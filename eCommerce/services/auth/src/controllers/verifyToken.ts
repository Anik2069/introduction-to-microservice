import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/prisma";
import { AccessTokenSchema } from "@/schema"

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {

        const parsedData = AccessTokenSchema.safeParse(req.body);

        if (!parsedData.success) {

            return res.status(400).json({
                message: "Invalid input data",
                errors: parsedData.error.errors,
            });
        }

        const { accessToken } = parsedData.data;

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: (decoded as any).id,
            },
            select: {
                id: true,
                email: true,
                role: true,
                name: true
            }
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json({
            message: "Authorized",
            user
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export default verifyToken