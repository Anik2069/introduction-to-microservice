import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';

const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;

        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                sku: true,
                description: true,
                price: true,
                status: true,
                inventoryId: true
            }

        });

        if (!products) {
            return res.status(404).json({
                message: 'Inventory item not found',
            });
        }

        // Respond with the inventory item
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

export default getProducts;