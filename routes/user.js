const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userauth");

// Signup
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    // Check username length
    if (username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username length should be greater than 3" });
    }

    // Check if username already exists
    const existinguser = await User.findOne({ username: username });
    if (existinguser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingemail = await User.findOne({ email: email });
    if (existingemail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check password length
    if (password.length <= 5) {
      return res
        .status(400)
        .json({ message: "Password length should be greater than 5" });
    }

    const hashpass = await bcrypt.hash(password, 10);

    // Create and save new user
    const newuser = new User({
      username: username,
      email: email,
      password: hashpass,
      address: address,
    });

    await newuser.save();
    return res.status(200).json({ message: "Sign-Up Successfully" });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// signin
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existinguser = await User.findOne({ username });
    if (!existinguser) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    await bcrypt.compare(password, existinguser.password, (err, data) => {
      if (data) {
        const authClaims = [
          { name: existinguser.username },
          { role: existinguser.role },
        ];
        const token = jwt.sign({ authClaims }, "bookStore123", {
          expiresIn: "30d",
        });
        return res.status(200).json({
          id: existinguser._id,
          role: existinguser.role,
          token: token,
        });
      } else {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// get-user-info
router.get("/get-user-information", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const data = await User.findById(id).select("-password");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

//update address
router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { address } = req.body;
    await User.findByIdAndUpdate(id, { address: address });
    return res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;
