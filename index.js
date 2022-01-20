const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const logger = require('morgan')
const passport = require('passport')
require('./db/mongoose')
require('dotenv').config()
require('./lib/passport')(passport);

const PORT = process.env.PORT || 8888;

// Routers here 
// const user_router = require('./routers/user_router')

// Global middleware here

const app = express()

app.use(passport.initialize())
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(helmet())

// Middleware routes
// app.use('/users', user.router)


app.get('*', (req, res) => {
  res.status(404).json({message: 'Resource not found'})
})

app.use(function (req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
})

app.listen(PORT, () => {
  console.log(`Backend of Yakumon is listening on port ${PORT}`)
})