const express = require('express');
const router = express.Router();
const { getTasks, createTask, deleteTask } = require('../controllers/task.controller.js');

// Mapeo de verbos HTTP a controladores
router.get('/', getTasks);
router.post('/', createTask);
router.delete('/:id', deleteTask);

module.exports = router;