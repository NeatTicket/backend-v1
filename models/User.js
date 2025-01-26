const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "place_owner", "admin"], 
    default: "user", 
  },
  isApproved: { type: Boolean, default: false }, 
  profileImage: {
    type: String,
    default: "https://www.pngall.com/wp-content/uploads/12/Avatar-PNG-Image.png",
  },
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
