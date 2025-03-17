require('dotenv').config()
const express = require('express');
const Person = require('./models/person')
const morgan = require('morgan');
const cors = require('cors')

const app = express();

app.use(cors())

app.use(express.static('dist'))

app.use(morgan('tiny'));

app.use(express.json());

// Create custom token to log request body
morgan.token('req-body', (req) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body);
    }
    return null;
  });

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));


app.get('/info', (request, response) => {
    Person.countDocuments({}).then(numEntries => {
        const currentTime = new Date().toString();
        response.send(`
            <p>Phonebook has info for ${numEntries} people</p>
            <p>${currentTime}</p>
        `);
    });
});

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
      })
});

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      response.json(person)
    })
  })

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        if (result) {
          response.status(204).end();
        } else {
          response.status(404).json({ error: 'Note not found' });
        }
      })
      .catch(error => response.status(400).json({ error: 'Invalid ID format' }));
  });

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
      return response.status(400).json({ error: 'Both name and number must be provided' })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
