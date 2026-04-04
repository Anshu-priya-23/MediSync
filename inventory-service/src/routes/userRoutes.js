const express = require("express");
const router = express.Router();

const userService = require("../services/userService");


// GET SUPPLIER PROFILE
router.get("/:id", async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// UPDATE SUPPLIER PROFILE
router.put("/:id", async (req, res) => {
  try {
    const updated = await userService.updateUserProfile(
      req.params.id,
      req.body
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;