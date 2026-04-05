const User = require("../models/User");
const bcrypt = require("bcryptjs");


// GET PROFILE
exports.getUserProfile = async (userId) => {
  return await User.findById(userId).select("-password");
};


// UPDATE PROFILE
exports.updateUserProfile = async (userId, data) => {
  const updateData = { ...data };

  // 🔐 If password is updated → hash it
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(data.password, salt);
  }

  return await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
};