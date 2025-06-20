import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import { InventoryCreateDTOSchema } from '@/schema';

const createInventory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Validate the input data against the schema
        const parsedData = InventoryCreateDTOSchema.safeParse(req.body);

        if (!parsedData.success) {
            // If validation fails, respond with a 400 status and the validation errors
            return res.status(400).json({
                message: 'Invalid input data',
                errors: parsedData.error.errors,
            });
        }

        // Create a new inventory item in the database
        const newInventory = await prisma.inventory.create({
            data: {
                ...parsedData.data,
                histories: {
                    create: {
                        actionType: 'In',
                        quantityChanged: parsedData.data.quantity || 0,
                        lastQuantity: 0,
                        newQuantity: parsedData.data.quantity || 0,
                    }
                }
            },
            select: {
                id: true,
                quantity: true,
            }
        });

        // Respond with the created inventory item
        res.status(201).json(newInventory);

        return;
    } catch (error) {
        next(error);
        return;
    }
}

export default createInventory;