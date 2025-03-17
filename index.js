require('dotenv').config()
const express = require('express');
const Person = require('./models/person')
const morgan = require('morgan');
const cors = require('cors')

const app = express();

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' });
    }

    next(error); // Forward other errors
  };

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

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
  })

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        if (result) {
          response.status(204).end();
        } else {
          response.status(404).json({ error: 'Note not found' });
        }
      })
      .catch(error => next(error));
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

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        if (updatedPerson) {
          response.json(updatedPerson)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

  app.use(unknownEndpoint)
  app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
