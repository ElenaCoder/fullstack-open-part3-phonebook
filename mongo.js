const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Usage:');
    console.log('  node mongo.js <password>           # List all entries');
    console.log('  node mongo.js <password> <name> <number>  # Add new entry');
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://potapovaes:${password}@cluster0.8yaog.mongodb.net/phonebookDB?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

mongoose
    .connect(url)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error:', err));

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Phonebook = mongoose.model('Phonebook', phonebookSchema);

// **List all entries if only the password is provided**
if (process.argv.length === 3) {
    Phonebook.find({}).then((result) => {
        console.log('Phonebook:');
        result.forEach((entry) => {
            console.log(`${entry.name} ${entry.number}`);
        });
        mongoose.connection.close();
    });
}

// **Add a new entry if name & number are provided**
if (process.argv.length === 5) {
    const name = process.argv[3];
    const number = process.argv[4];

    const phonebookEntry = new Phonebook({ name, number });

    phonebookEntry.save().then(() => {
        console.log(`Added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    });
}
