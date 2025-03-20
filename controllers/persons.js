const personsRouter = require('express').Router();
const Person = require('../models/person');

personsRouter.get('/info', (request, response) => {
    Person.countDocuments({}).then((numEntries) => {
        const currentTime = new Date().toString();
        response.send(`
              <p>Phonebook has info for ${numEntries} people</p>
              <p>${currentTime}</p>
          `);
    });
});

personsRouter.get('/', (request, response) => {
    Person.find({}).then((persons) => {
        response.json(persons);
    });
});

personsRouter.get('/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

personsRouter.delete('/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then((result) => {
            if (result) {
                response.status(204).end();
            } else {
                response.status(404).json({ error: 'Note not found' });
            }
        })
        .catch((error) => next(error));
});

personsRouter.post('/', (request, response, next) => {
    const { name, number } = request.body;

    if (!name || !number) {
        return response
            .status(400)
            .json({ error: 'Both name and number must be provided' });
    }

    // Check if the person already exists by name
    Person.findOne({ name })
        .then((existingPerson) => {
            if (existingPerson) {
                return response
                    .status(400)
                    .json({ error: 'Name already exists.' });
            }

            // If person doesn't exist, create a new person
            const person = new Person({ name, number });

            return person
                .save()
                .then((savedPerson) => response.json(savedPerson))
                .catch((error) => next(error));
        })
        .catch((error) => next(error));
});

personsRouter.put('/:id', (request, response, next) => {
    const { number } = request.body;
    const { id } = request.params;

    if (!number) {
        return response.status(400).json({ error: 'Number must be provided' });
    }

    Person.findByIdAndUpdate(
        id,
        { number },
        { new: true, runValidators: true, context: 'query' },
    )
        .then((updatedPerson) => {
            if (!updatedPerson) {
                return response.status(404).json({ error: 'Person not found' });
            }
            response.json(updatedPerson);
        })
        .catch((error) => next(error));
});

module.exports = personsRouter;
