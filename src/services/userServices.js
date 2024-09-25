const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//creacion usuario con password encriptada
const createUser = async (userData) => {
    const { email } = userData;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email ya registrado');
    
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
};
//autenticacion
const authenticateUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error('Credenciales incorrectas');
    }
    return user;
};

//aqui genera el JWT
const generateJWT = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

module.exports = {
    createUser,
    authenticateUser,
    generateJWT,
};
