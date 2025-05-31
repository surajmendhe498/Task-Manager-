const express= require('express');
const { createTask, getTasks, updateTask, deleteTask, fetchTaskById } = require('../controllers/task.controller');
const authenticate = require('../middlewares/auth.middleware');
const router= express.Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

router.get('/:id', fetchTaskById);


module.exports= router;