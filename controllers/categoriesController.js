const Categorie = require("../models/Categorie.js");
const User = require("../models/User.js");

// @desc Get all categories
// @route GET /categories
// @access Private
const getAllCategories = async (req, res) => {
  // Get all categories from MongoDB
  const user = await User.findOne({ username: req.user }).lean();

  // Encontra as notas associadas a todos os usuarios
  const categories = await Categorie.find().lean();

  // If no categories
  if (!categories?.length) {
    return res.status(400).json({ message: "No categories found" });
  }
  // Add username to each categorie before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  let categoriesWithUser = await Promise.all(
    categories.map(async (categorie) => {
      const user = await User.findById(categorie.user).lean().exec();
      return { ...categorie, username: user.username };
    })
  );

  res.json(categoriesWithUser);
};

// @desc Create new categorie
// @route POST /categories
// @access Private
const createNewCategorie = async (req, res) => {
  const { user, name } = req.body;

  // Confirm data
  if (!user || !name) {
    return res.status(400).json({ message: "user and name are required" });
  }
  if (name.length > 40 || name.lenght < 3) {
    return res
      .status(400)
      .json({ message: "name needs min 3 max 40 characteres" });
  }

  // Create and store the new user
  const categorie = await Categorie.create({
    user,
    name,
  });

  if (categorie) {
    // Created
    return res.status(201).json({ message: "New categorie created" });
  } else {
    return res.status(400).json({ message: "Invalid categorie data received" });
  }
};

// @desc Update a categorie
// @route PATCH /categories
// @access Private
const updateCategorie = async (req, res) => {
  const { id, name } = req.body;

  // Confirm data
  if (!name || !id) {
    return res.status(400).json({ message: "name are required" });
  }
  if (name.length > 40 || name.lenght < 3) {
    return res
      .status(400)
      .json({ message: "name needs min 3 max 40 characteres" });
  }

  // Confirm categorie exists to update
  const categorie = await Categorie.findById(id).exec();

  if (!categorie) {
    return res.status(400).json({ message: "Categorie not found" });
  }

  // Check for duplicate title
  // Removed
  const oldName = categorie.name;
  categorie.name = name;

  const updatedCategorie = await categorie.save();

  res.json(`${oldName} updated to ${updatedCategorie.name}`);
};

// @desc Delete a categorie
// @route DELETE /categories
// @access Private
const deleteCategorie = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Categorie ID required" });
  }

  // Confirm categorie exists to delete
  const categorie = await Categorie.findById(id).exec();

  if (!categorie) {
    return res.status(400).json({ message: "Categorie not found" });
  }

  const result = await categorie.deleteOne();

  const reply = `Categorie '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllCategories,
  createNewCategorie,
  updateCategorie,
  deleteCategorie,
};
