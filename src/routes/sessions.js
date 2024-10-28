const express = require('express');
const router = express.Router();
const { createUser, authenticateUser, generateJWT } = require('../services/userServices');
const { authMiddleware } = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const newUser = await createUser(req.body);
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/user');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authenticateUser(email, password);
        const token = generateJWT(user);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/user');
    } catch (error) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
});

// Ruta protegida para obtener el usuario actual
router.get('/user', authMiddleware, (req, res) => { 
    if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    res.render('current', { 
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            age: req.user.age
        }
    });
});

// Ruta para el logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/api/sessions/login');
});

module.exports = router;
