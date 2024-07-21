const express = require('express')
const app = express()
const path = require('path');
const fs = require('fs');
const port = 3000

const tasksFilePath = path.join(__dirname, 'tasks', 'tasks.json');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/add', (req, res) => {
    const newTask = req.body;
    console.log('Task received', newTask);
    if(newTask) {
        
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
                }
            });
        });
        res.status(200).json({"message": "Task is added successfully"});
    } else {
        res.status(500).json({"message": "Task was not added successfully"});
    }
})

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})