import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import axios from 'axios';
import { INVENTORY_URL } from '@/config';

const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                sku: true,
                description: true,
                inventoryId: true,
            }
        });

        if (!product) {
            return res.status(404).json({
                message: 'Product item not found',
            });
        }

        if (!product.inventoryId) {
            return res.status(404).json({
                message: 'Product does not have an associated inventory item',
            });
        }
        const { data: inventory } = await axios.get(
            `${INVENTORY_URL}/inventories/${product.inventoryId}`);

        // Respond with the inventory item
        res.status(200).json({
            ...product,
            stock: inventory.quantity,
            stockStatus: inventory.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        });
    } catch (error) {
        next(error);
    }
};

export default getProductById;