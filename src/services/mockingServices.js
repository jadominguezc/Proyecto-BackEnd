const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const generateMockUsers = (userCount = 50, petCount = 0) => {
  const users = [];
  const hashedPassword = bcrypt.hashSync("coder123", 10); 

  for (let i = 0; i < userCount; i++) {
    const user = {
      _id: new mongoose.Types.ObjectId(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      password: hashedPassword,
      role: faker.helpers.arrayElement(["user", "admin"]),
      pets: [],
    };
    users.push(user);
  }
  return users;
};

module.exports = {
  generateMockUsers,
};
