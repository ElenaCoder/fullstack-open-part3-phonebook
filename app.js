
const config = require('./utils/config')
const logger = require('./utils/logger')
const express = require('express')
const app = express()
const personsRouter = require('./controllers/persons')
const middleware = require('./utils/middleware')
const morgan = require('./utils/morganConfig');
const cors = require('cors')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(morgan('tiny'))
app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body',
  ),
)

app.use('/api/persons', personsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app