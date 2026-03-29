const express = require('express');
const router = express.Router(); // creamos el mini-enrutador de Express
const taskController = require('../controllers/task.controller'); // traemos al "encargado" (el controlador)

// definimos qué hacer según el verbo HTTP
router.get('/', taskController.getTasks);      // Si piden ver todo -> llama a getTasks
router.post('/', taskController.createTask);    // Si mandan una reseña -> llama a createTask
router.delete('/:id', taskController.deleteTask); // Si quieren borrar -> llama a deleteTask con el ID

module.exports = router; // 4. Lo exportamos para que el index.js lo pueda usar