require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const app = express;
const PORT = process.env.PORT || 3000;

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many submissions from this IP - Please try again later.'}
});

const transporter = nodemailer.createTrasnport({
    host: process.env.SKIP_HOST,
    port: Number(process.env.SJIP_PORT) || 507,
    secure: process.env.SKIP_SECURE === 'true',
    auth: {
        user: process.env.SKIP_USER,
        pass: process.env.SKIP_PASS
    }
});

function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/contact', contactLimiter, async ( req,res) =>{
    const {name, email, projectType, message, honeypot} = req.body;

    if(honeypot){
        return res.status(200).json({ success: true});
    }

    if(!name || !email || !message){
        return res.status(400).json({error: 'Name, email, message are required!'});
    }

    if(!isValidEmail(email)){
        return res.status(400).json({ error: 'Please provide a valid email address!'});
    }

    if(message.length > 5000) {
        return res.status(400).json({ error: 'Message is too long!'});
    }

    try{
        await transporter.sendMail({
            from: `"Portfolio Contact Form" <${process.env.SKIP_USER}>`,
            tp: process.env.CONTACT_RECEIVER_EMAIL,
            replyTo: email,
            subject: `New ${prokectType || 'General Inquiry'} message from ${name}`,
            text: `Name ${name}\nEmail: ${email}\nProjectType || 'N/A'\n\nMessage: \n${message}`,
            html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Project Type:</strong> ${projectType || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        res.status(200).json({success: true});
    } catch(err){
        console.error('Email send failed: ', err);
        res.status(500).json({error:'Spmething wet wrong sending the email. Please try again later.'});
    }
});

app.listen(PORT, ()=>{
    console.log('Server running on port ${PORT}')
});

