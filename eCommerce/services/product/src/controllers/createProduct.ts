import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import axios from 'axios';
import { ProductCreateDTOSchema } from '@/schema';
import { INVENTORY_URL } from '@/config';

const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Validate the input data against the schema
        const parsedData = ProductCreateDTOSchema.safeParse(req.body);

        if (!parsedData.success) {
            // If validation fails, respond with a 400 status and the validation errors
            return res.status(400).json({
                message: 'Invalid input data',
                errors: parsedData.error.errors,
            });
        }
        const existingProduct = await prisma.product.findUnique({
            where: {
                sku: parsedData.data.sku,
            },
        });
        if (existingProduct) {

            return res.status(409).json({
                message: 'Product with this SKU already exists',
            });
        }
        // Create a new inventory item in the database
        const newProduct = await prisma.product.create({
            data: {
                ...parsedData.data,
            },
            select: {
                id: true,
                name: true,
                sku: true,
                description: true,
                price: true,
                status: true,
            }
        });

        // Respond with the created inventory item
        const { data: inventory } = await axios.post(
            `${INVENTORY_URL}/inventories`,
            {
                productId: newProduct.id,
                sku: newProduct.sku,
            }
        )

        await prisma.product.update({
            where: {
                id: newProduct.id,
            },
            data: {
                inventoryId: inventory.id,
            },
        });
        res.status(201).json(newProduct);

        return;
    } catch (error) {
        next(error);
        return;
    }
}
const updateProduct = async(req)=>{

}

export default createProduct;