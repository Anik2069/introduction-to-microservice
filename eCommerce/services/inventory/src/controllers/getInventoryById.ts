import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';

const getInventoryById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                productId: true,
                sku: true,
                quantity: true,
            }
        });

        if (!inventory) {
            return res.status(404).json({
                message: 'Inventory item not found',
            });
        }

        // Respond with the inventory item
        res.status(200).json(inventory);
    } catch (error) {
        next(error);
    }
};

export default getInventoryById;