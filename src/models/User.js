import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  pets: { type: Array, default: [] }, // Array vacío por defecto de acuerdo a lo que dice la consigna
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  role: { type: String, default: "user" },
});

// Encriptar la contraseña antes de guardar
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
