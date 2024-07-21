const path = require("path");
const cron = require('node-cron');
const fs = require("fs");
const nodemailer = require("nodemailer");

require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.in',
    port: 465,
    secure: true, //ssl
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASS,
    }
});

function sendMail(mailOptions) {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}

function scheduleReminders() {
    const tasksFilePath = path.join(__dirname, 'tasks', 'tasks.json');
    cron.schedule('* * * * * *', () => {
        fs.readFile(tasksFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading tasks.json:', err);
                return;
            }

            let tasksJson;
            try {
                tasksJson = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing tasks.json:', parseError);
                return;
            }

            const now = new Date();
            tasksJson.tasks.forEach((task) => {
                const taskTime = new Date(task.createdAt);

                switch (task.reminderType) {
                    case 'Minutely':
                        if (now.getSeconds() === taskTime.getSeconds()) {
                            var mailOptions = {
                                from: `Reminders.xyz ${process.env.APP_EMAIL}`,
                                to: task.email,
                                subject: `${task.reminderType} Reminder: ${task.name}`,
                                html: `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            background-color: #f4f4f9;
                                            margin: 0;
                                            padding: 0;
                                            color: #333;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            background-color: #ffffff;
                                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                        }
                                        .header {
                                            text-align: center;
                                            padding: 20px 0;
                                            background-color: #4CAF50;
                                            color: #ffffff;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 24px;
                                        }
                                        .content {
                                            padding: 20px;
                                            line-height: 1.6;
                                        }
                                        .content h2 {
                                            font-size: 20px;
                                            margin: 0 0 10px;
                                        }
                                        .content p {
                                            margin: 0 0 20px;
                                        }
                                        .footer {
                                            text-align: center;
                                            padding: 10px 0;
                                            background-color: #f4f4f9;
                                            color: #777;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>Reminder: ${task.name}</h1>
                                        </div>
                                        <div class="content">
                                            <h2>${task.reminderType} Reminder</h2>
                                            <p>Hello,</p>
                                            <p>This is a reminder for your task: <strong>${task.name}</strong></p>
                                            <p>Task Details:</p>
                                            <ul>
                                                <li><strong>Task Name:</strong> ${task.name}</li>
                                                <li><strong>Reminder Type:</strong> ${task.reminderType}</li>
                                            </ul>
                                            <p>Please make sure to complete your task on time.</p>
                                            <p>Best Regards,<br>Reminders.xyz Team</p>
                                        </div>
                                        <div class="footer">
                                            <p>&copy; ${new Date().getFullYear()} Reminders.xyz. All rights reserved.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>`
                            }
                            console.log("Sending mail for minute");
                            sendMail(mailOptions);
                            console.log(`Reminder for task: ${task.name} sent!`);
                        }
                        break;
                    case 'Hourly':
                        if (now.getMinutes() === taskTime.getMinutes() && now.getSeconds() === taskTime.getSeconds()) {
                            var mailOptions = {
                                from: `Reminders.xyz ${process.env.APP_EMAIL}`,
                                to: task.email,
                                subject: `${task.reminderType} ${task.name} Reminder`,
                                html: `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            background-color: #f4f4f9;
                                            margin: 0;
                                            padding: 0;
                                            color: #333;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            background-color: #ffffff;
                                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                        }
                                        .header {
                                            text-align: center;
                                            padding: 20px 0;
                                            background-color: #4CAF50;
                                            color: #ffffff;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 24px;
                                        }
                                        .content {
                                            padding: 20px;
                                            line-height: 1.6;
                                        }
                                        .content h2 {
                                            font-size: 20px;
                                            margin: 0 0 10px;
                                        }
                                        .content p {
                                            margin: 0 0 20px;
                                        }
                                        .footer {
                                            text-align: center;
                                            padding: 10px 0;
                                            background-color: #f4f4f9;
                                            color: #777;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>Reminder: ${task.name}</h1>
                                        </div>
                                        <div class="content">
                                            <h2>${task.reminderType} Reminder</h2>
                                            <p>Hello,</p>
                                            <p>This is a reminder for your task: <strong>${task.name}</strong></p>
                                            <p>Task Details:</p>
                                            <ul>
                                                <li><strong>Task Name:</strong> ${task.name}</li>
                                                <li><strong>Reminder Type:</strong> ${task.reminderType}</li>
                                            </ul>
                                            <p>Please make sure to complete your task on time.</p>
                                            <p>Best Regards,<br>Reminders.xyz Team</p>
                                        </div>
                                        <div class="footer">
                                            <p>&copy; ${new Date().getFullYear()} Reminders.xyz. All rights reserved.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>`
                            }
                            console.log("Sending mail for hour");
                            sendMail(mailOptions);
                            console.log(`Reminder for task: ${task.name} sent!`);
                        }
                        break;
                    case 'Daily':
                        if (now.getHours() === taskTime.getHours() && now.getMinutes() === taskTime.getMinutes() && now.getSeconds() === taskTime.getSeconds()) {
                            var mailOptions = {
                                from: `Reminders.xyz ${process.env.APP_EMAIL}`,
                                to: task.email,
                                subject: `${task.reminderType} ${task.name} Reminder`,
                                html: `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            background-color: #f4f4f9;
                                            margin: 0;
                                            padding: 0;
                                            color: #333;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            background-color: #ffffff;
                                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                        }
                                        .header {
                                            text-align: center;
                                            padding: 20px 0;
                                            background-color: #4CAF50;
                                            color: #ffffff;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 24px;
                                        }
                                        .content {
                                            padding: 20px;
                                            line-height: 1.6;
                                        }
                                        .content h2 {
                                            font-size: 20px;
                                            margin: 0 0 10px;
                                        }
                                        .content p {
                                            margin: 0 0 20px;
                                        }
                                        .footer {
                                            text-align: center;
                                            padding: 10px 0;
                                            background-color: #f4f4f9;
                                            color: #777;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>Reminder: ${task.name}</h1>
                                        </div>
                                        <div class="content">
                                            <h2>${task.reminderType} Reminder</h2>
                                            <p>Hello,</p>
                                            <p>This is a reminder for your task: <strong>${task.name}</strong></p>
                                            <p>Task Details:</p>
                                            <ul>
                                                <li><strong>Task Name:</strong> ${task.name}</li>
                                                <li><strong>Reminder Type:</strong> ${task.reminderType}</li>
                                            </ul>
                                            <p>Please make sure to complete your task on time.</p>
                                            <p>Best Regards,<br>Reminders.xyz Team</p>
                                        </div>
                                        <div class="footer">
                                            <p>&copy; ${new Date().getFullYear()} Reminders.xyz. All rights reserved.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>`
                            }
                            console.log("Sending mail for hour");
                            sendMail(mailOptions);
                            console.log(`Reminder for task: ${task.name} sent!`);
                        }
                        break;
                    case 'Weekly':
                        if (now.getDay() === taskTime.getDay() && now.getHours() === taskTime.getHours() && now.getMinutes() === taskTime.getMinutes() && now.getSeconds() === taskTime.getSeconds()) {
                            var mailOptions = {
                                from: `Reminders.xyz ${process.env.APP_EMAIL}`,
                                to: task.email,
                                subject: `${task.reminderType} ${task.name} Reminder`,
                                html: `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            background-color: #f4f4f9;
                                            margin: 0;
                                            padding: 0;
                                            color: #333;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            background-color: #ffffff;
                                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                        }
                                        .header {
                                            text-align: center;
                                            padding: 20px 0;
                                            background-color: #4CAF50;
                                            color: #ffffff;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 24px;
                                        }
                                        .content {
                                            padding: 20px;
                                            line-height: 1.6;
                                        }
                                        .content h2 {
                                            font-size: 20px;
                                            margin: 0 0 10px;
                                        }
                                        .content p {
                                            margin: 0 0 20px;
                                        }
                                        .footer {
                                            text-align: center;
                                            padding: 10px 0;
                                            background-color: #f4f4f9;
                                            color: #777;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>Reminder: ${task.name}</h1>
                                        </div>
                                        <div class="content">
                                            <h2>${task.reminderType} Reminder</h2>
                                            <p>Hello,</p>
                                            <p>This is a reminder for your task: <strong>${task.name}</strong></p>
                                            <p>Task Details:</p>
                                            <ul>
                                                <li><strong>Task Name:</strong> ${task.name}</li>
                                                <li><strong>Reminder Type:</strong> ${task.reminderType}</li>
                                            </ul>
                                            <p>Please make sure to complete your task on time.</p>
                                            <p>Best Regards,<br>Reminders.xyz Team</p>
                                        </div>
                                        <div class="footer">
                                            <p>&copy; ${new Date().getFullYear()} Reminders.xyz. All rights reserved.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>`
                            }
                            console.log("Sending mail for hour");
                            sendMail(mailOptions);
                            console.log(`Reminder for task: ${task.name} sent!`);
                        }
                        break;
                    case 'Monthly':
                        if (now.getDate() === taskTime.getDate() && now.getHours() === taskTime.getHours() && now.getMinutes() === taskTime.getMinutes() && now.getSeconds() === taskTime.getSeconds()) {
                            var mailOptions = {
                                from: `Reminders.xyz ${process.env.APP_EMAIL}`,
                                to: task.email,
                                subject: `${task.reminderType} ${task.name} Reminder`,
                                html: `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            background-color: #f4f4f9;
                                            margin: 0;
                                            padding: 0;
                                            color: #333;
                                        }
                                        .container {
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            background-color: #ffffff;
                                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                        }
                                        .header {
                                            text-align: center;
                                            padding: 20px 0;
                                            background-color: #4CAF50;
                                            color: #ffffff;
                                        }
                                        .header h1 {
                                            margin: 0;
                                            font-size: 24px;
                                        }
                                        .content {
                                            padding: 20px;
                                            line-height: 1.6;
                                        }
                                        .content h2 {
                                            font-size: 20px;
                                            margin: 0 0 10px;
                                        }
                                        .content p {
                                            margin: 0 0 20px;
                                        }
                                        .footer {
                                            text-align: center;
                                            padding: 10px 0;
                                            background-color: #f4f4f9;
                                            color: #777;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>Reminder: ${task.name}</h1>
                                        </div>
                                        <div class="content">
                                            <h2>${task.reminderType} Reminder</h2>
                                            <p>Hello,</p>
                                            <p>This is a reminder for your task: <strong>${task.name}</strong></p>
                                            <p>Task Details:</p>
                                            <ul>
                                                <li><strong>Task Name:</strong> ${task.name}</li>
                                                <li><strong>Reminder Type:</strong> ${task.reminderType}</li>
                                            </ul>
                                            <p>Please make sure to complete your task on time.</p>
                                            <p>Best Regards,<br>Reminders.xyz Team</p>
                                        </div>
                                        <div class="footer">
                                            <p>&copy; ${new Date().getFullYear()} Reminders.xyz. All rights reserved.</p>
                                        </div>
                                    </div>
                                </body>
                                </html>`
                            }
                            console.log("Sending mail for hour");
                            sendMail(mailOptions);
                            console.log(`Reminder for task: ${task.name} sent!`);
                        }
                        break;
                }
            });
        });
    });
}

scheduleReminders();