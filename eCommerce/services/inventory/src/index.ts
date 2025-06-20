// index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import { createInventory, getInventoryById, getInventoryDetails, updateInventory } from './controllers';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

app.put('/inventories/:id', updateInventory);
app.get('/inventories/:id', getInventoryById);
app.get('/inventories/:id/details', getInventoryDetails);
app.post('/inventories', createInventory);



// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Start server
const port = process.env.PORT || 4002;
const serviceName = process.env.SERVICE_NAME || 'inventory-service';

app.listen(port, () => {
    console.log(`${serviceName} is running on port ${port}`);
});
