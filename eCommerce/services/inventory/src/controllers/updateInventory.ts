import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import { InventoryUpdateDTOSchema } from '@/schema';

const updateInventory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Validate the input data against the schema
        const { id } = req.params;
        const inventory = await prisma.inventory.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                quantity: true,
            }
        });

        if (!inventory) {
            return res.status(404).json({
                message: 'Inventory item not found',
            });
        }

        const parsedData = InventoryUpdateDTOSchema.safeParse(req.body);

        if (!parsedData.success) {
            // If validation fails, respond with a 400 status and the validation errors
            return res.status(400).json({
                message: 'Invalid input data',
                errors: parsedData.error.errors,
            });
        }
        const lastHistory = await prisma.history.findFirst({
            where: {
                inventoryId: id
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        let newQuantity = inventory.quantity;
        if (parsedData.data.actionType === 'In') {
            newQuantity += parsedData.data.quantity;
        } else if (parsedData.data.actionType === 'Out') {
            newQuantity -= parsedData.data.quantity;
        } else {
            return res.status(400).json({
                message: 'Invalid action type. Must be "In" or "Out".',
            });
        }

        // Update the inventory item in the database
        const updatedInventory = await prisma.inventory.update({
            where: {
                id: req.params.id,
            },
            data: {
                quantity: newQuantity,
                histories: {
                    create: {
                        actionType: parsedData.data.actionType,
                        quantityChanged: parsedData.data.quantity,
                        lastQuantity: lastHistory?.newQuantity || 0, // This will be set by Prisma automatically
                        newQuantity, // This will be set by Prisma automatically
                    }
                }
            },
            select: {
                id: true,
                quantity: true,
            }
        });

        // Respond with the updated inventory item
        res.status(200).json(updatedInventory);

        return;
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return;
    }

};

export default updateInventory;