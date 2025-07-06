import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
});

export const DEFAULT_SENDER_EMAIL = process.env.DEFAULT_SENDER_EMAIL || "admin@app.com";