const express = require('express');
const router = express.Router();
const { createUser, authenticateUser, generateJWT } = require('../services/userServices');
const authMiddleware = require('../middlewares/authMiddleware');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const newUser = await createUser(req.body);
        res.status(201).json({ success: true, user: newUser });
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
        
        // Guardar el token en una cookie
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/current');
    } catch (error) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
});

// Ruta protegida para obtener el usuario actual
router.get('/current', authMiddleware, (req, res) => {
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

module.exports = router;
