const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('tiny'));

app.use(express.json());

let persons = [
    {
        id: '1',
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: '2',
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: '3',
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: '4',
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
];

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/info', (request, response) => {
    const numEntries = persons.length;
    const currentTime = new Date().toString();

    response.send(`
    <p>Phonebook has info for ${numEntries} people</p>
    <p>${currentTime}</p>
    `);
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find((p) => p.id === id);

    if (person) {
        response.json(person);
    } else {
        response.status(404).json({ error: 'Person not found' });
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const personExists = persons.some((p) => p.id === id);

    if (!personExists) {
        return response.status(404).json({ error: 'Person not found' });
    }

    persons = persons.filter((p) => p.id !== id);
    response.status(204).end();
});

app.post('/api/persons', (request, response) => {
    const { name, number } = request.body;

    if (!name || !number) {
        return response.status(400).json({ error: "Name and number are required" });
    }

    const nameExists = persons.some(p => p.name === name);
    if (nameExists) {
        return response.status(400).json({ error: "Name must be unique" });
    }

    const id = Math.floor(Math.random() * 1000000).toString();

    const newPerson = { id, name, number };
    persons.push(newPerson);

    response.status(201).json(newPerson);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
