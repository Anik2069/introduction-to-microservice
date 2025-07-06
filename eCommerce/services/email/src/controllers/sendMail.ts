import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { EmailCreateDTOSchema } from "@/schema";
import { text } from "stream/consumers";
import { DEFAULT_SENDER_EMAIL, transporter } from "@/config";

const sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Validate the input data against the schema
        const parsedData = EmailCreateDTOSchema.safeParse(req.body);
        if (!parsedData.success) {
            // If validation fails, respond with a 400 status and the validation errors
            return res.status(400).json({
                message: "Invalid input data",
                errors: parsedData.error.errors,
            });
        }
        // Create a new inventory item in the database
        const { sender, recipient, subject, body, source } = parsedData.data;

        const from = sender || DEFAULT_SENDER_EMAIL;
        const emailOptions = {
            from,
            to: recipient,
            subject,
            text: body,
        }
        const { rejected } = await transporter.sendMail(emailOptions);

        if (rejected.length) {
            console.log("EMial Rejected", rejected);
            return res.status(500).json({
                message: "Mail Is rejected",
            });
        }


        const email = await prisma.email.create({
            data: {
                sender: from,
                recipient,
                subject,
                body,
                source
            },
        });
        // Return the created inventory item
        return res.status(201).json({
            message: "Mail Sent",
            email
        });
    } catch (error) {
        next(error);
    }
};  


export default sendEmail