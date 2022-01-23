const express = require('express')
const router = new express.Router()

// Controller
const appointment_controller = require('../controllers/appointment_controller')

router.post('/', [auth], appointment_controller.appointment_post)

router.get('/id', [auth]. appointment_controller.appointment_get)

router.patch('/id', [auth], appointment_controller.appointment_patch)

router.delete('/id', [auth], appointment_controller.appointment_delete)