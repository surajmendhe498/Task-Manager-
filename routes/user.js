const express= require('express');
const { signUp, login, getAllUsers, me, updateUser, deleteUser } = require('../controllers/user.controller');
const authenticate= require('../middlewares/auth.middleware');
const router= express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/', authenticate, getAllUsers);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

module.exports= router;