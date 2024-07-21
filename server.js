const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();
const port = process.env.PORT || 3000;

const tasksFilePath = path.join(__dirname, 'tasks', 'tasks.json');

let cronProcess;

function startCron() {
    cronProcess = exec('node ' + path.join(__dirname, 'cron.js'));
    cronProcess.stdout.on('data', (data) => {
        console.log(`Cron stdout: ${data}`);
    });
    cronProcess.stderr.on('data', (data) => {
        console.error(`Cron stderr: ${data}`);
    });
    console.log('Cron job started');
}

function stopCron() {
    if (cronProcess) {
        cronProcess.kill();
        console.log('Cron job stopped');
    }
}

startCron();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/add', (req, res) => {
    const newTask = req.body;
    console.log('Task received', newTask);
    if (newTask) {
        fs.readFile(tasksFilePath, 'utf8', (err, data) => {
            let tasksJson;

            if (err) {
                // If the file doesn't exist or can't be read, initialize with an empty tasks array
                tasksJson = { tasks: [] };
            } else {
                try {
                    tasksJson = JSON.parse(data);
                } catch (parseError) {
                    console.error('Error parsing tasks.json:', parseError);
                    tasksJson = { tasks: [] };
                }
            }

            // Append the new task to the tasks array
            tasksJson.tasks.push(newTask);

            // Write the updated tasks back to tasks.json
            fs.writeFile(tasksFilePath, JSON.stringify(tasksJson, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to tasks.json:', writeErr);
                } else {
                    console.log('Task successfully added to tasks.json');
                    stopCron();
                    startCron();
                }
            });
        });
        res.status(200).json({ "message": "Task is added successfully" });
    } else {
        res.status(500).json({ "message": "Task was not added successfully" });
    }
});

app.get('/list', (req, res) => {
    const email = req.query.email; // Changed from req.body to req.query for GET request

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    fs.readFile(tasksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tasks.json:', err);
            return res.status(500).json({ error: 'Error reading tasks' });
        }

        let tasksJson;
        try {
            tasksJson = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing tasks.json:', parseError);
            return res.status(500).json({ error: 'Error parsing tasks data' });
        }

        // Filter tasks by email
        const filteredTasks = tasksJson.tasks.filter((task) => task.email === email);

        res.json({ tasks: filteredTasks });
    });
});

app.post('/remove', (req, res) => {
    const id = req.body.task_id;
    console.log(req.body)
    console.log('Task to be removed:', id);
    console.log('Task to be removed:', id);

    //write query to remove task from tasks.json using task_id
    if (id) {
        fs.readFile(tasksFilePath, 'utf8', (err, data) => {
            let tasksJson;

            if (err) {
                console.error('Error reading tasks.json:', err);
                return res.status(500).json({ error: 'Error reading tasks' });
            } else {
                try {
                    tasksJson = JSON.parse(data);
                } catch (parseError) {
                    console.error('Error parsing tasks.json:', parseError);
                    tasksJson = { tasks: [] };
                }
            }

            tasksJson.tasks = tasksJson.tasks.filter((task) => task.id !== id);

            // Write the updated tasks back to tasks.json
            fs.writeFile(tasksFilePath, JSON.stringify(tasksJson, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to tasks.json:', writeErr);
                } else {
                    console.log('Task successfully added to tasks.json');
                    stopCron();
                    startCron();
                }
            });
        });
        console.log('Task removed successfully');
        res.status(200).json({ "message": "Task removed successfully" });
    } else {
        res.status(500).json({ "message": "Task was not removed successfully" });
    }

})

app.post('/otp', (req, res) => {
    const { otp, email } = req.body;

    console.log(otp);

    var mailOptions = {
        from: `Reminders.xyz ${process.env.APP_EMAIL}`,
        to: email,
        subject: `Your One-Time Password for Reminders.xyz`,
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
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    padding: 10px;
                    background-color: #f0f0f0;
                    border-radius: 5px;
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
                    <h1>Your One-Time Password</h1>
                </div>
                <div class="content">
                    <h2>Verification Required</h2>
                    <p>Hello,</p>
                    <p>You've requested a one-time password (OTP) for your Reminders.xyz account. Please use the following OTP to complete your action:</p>
                    <div class="otp">${otp}</div>
                    <p>This OTP will expire in 10 minutes for security reasons.</p>
                    <p>If you didn't request this OTP, please ignore this email or contact our support team if you have any concerns.</p>
                    <p>Best Regards,<br>Reminders.xyz Team</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Reminders.xyz. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response)
        }
    })

    // Process the OTP here
    // For example, you might validate it, store it, or use it for authentication

    // Respond with a success message
    res.status(200).json({ message: 'OTP received successfully', otp });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

process.on('exit', () => {
    stopCron();
});
