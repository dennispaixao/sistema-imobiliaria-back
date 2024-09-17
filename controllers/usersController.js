const User = require("../models/User");
const Product = require("../models/Product");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  // Get all users from MongoDB
  const user = await User.findOne({ username: req.user }).lean();
  let users = null;
  if (!user.roles.includes("Admin")) {
    users = await User.find({ username: req.user }).select("-password").lean();
  } else {
    users = await User.find().select("-password").lean();
  }
  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
};

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body;
  console.log(req.user, req.roles);
  console.log(roles);
  //NOTE TO DO VALIDATIONS
  if (roles.find((i) => i == "Admin") && !req.roles.find((i) => i == "Admin")) {
    return res.status(400).json({
      message: "creation of admins are only possibilited by other admins",
    });
  }
  // Confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check lengths
  const usernamelength = username.length;
  const passwordlength = username.length;

  if (usernamelength < 3 || usernamelength > 20) {
    return res
      .status(400)
      .json({ message: "Usernme must to be enter 3 and 20 characters" });
  }

  if (passwordlength < 3 || passwordlength > 20) {
    return res
      .status(400)
      .json({ message: "Password must to be enter 3 and 20 characters" });
  }

  //chek if equals username

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  //NOTE TO DO VALIDATIONS
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }
  //NOTA MUDAR APENAS O STATUS DO PRODUTO PARA 0

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  user.active = false;
  const updatedUser = await user.save();

  res.json({ message: `User deleted` });

  const reply = `User deleted`;

  res.json(reply);
};

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
