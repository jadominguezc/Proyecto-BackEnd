const User = require('../models/User');

class UserDAO {
    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    async findUserById(userId) {
        return await User.findById(userId);
    }
}

module.exports = new UserDAO();
