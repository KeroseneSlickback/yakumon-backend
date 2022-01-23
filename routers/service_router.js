const express = require('express')
const router = new express.Router()

// Controllers 
const service_controller = require('../controllers/service_controller')

router.post('/', [auth], service_controller.service_create)

router.get('/', [auth], service_controller.service_get)

router.patch('/:id', [auth], service_controller.service_patch)

router.delete('/:id', [auth], service_controller.service_delete)