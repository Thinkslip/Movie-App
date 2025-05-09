const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Debug
        console.log("Signup request body:", req.body);

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "Email already in use"});

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({ message: "User created successfully!", token });
    } catch (error) {
        next(error);
    }
});

// Login route
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email} });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h"});

        res.json({ message: "Login successful", token});
    } catch (error) {
        next(error);
    }
});

module.exports = router;