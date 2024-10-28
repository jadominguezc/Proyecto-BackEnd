const userService = require('../services/userServices');
const UserDTO = require('../dtos/user.dto');
const cartService = require('../services/cartServices');


// Registro de usuario
const registerUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        
        const cart = await cartService.createOrGetCart(newUser);
        newUser.cart = cart._id;
        await newUser.save();

        const token = userService.generateJWT(newUser);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/user');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
    }
};

// Login de usuario
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.authenticateUser(email, password);
        const token = userService.generateJWT(user);

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/user');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
};

// Obtener el usuario actual
const getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    res.render('current', {
        user: new UserDTO(req.user)
    });

    const userDTO = new UserDTO(req.user);
    res.status(200).json({ user: userDTO });
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
};
