const Product = require("../models/Product.js");
const User = require("../models/User");
const { refresh } = require("./authController");

// @desc Get all products
// @route GET /products
// @access Private
const getAllProducts = async (req, res) => {
  try {
    // Obter todos os produtos do MongoDB
    const products = await Product.find().populate("user").lean();

    // Se não encontrar produtos
    if (!products?.length) {
      return res.status(400).json({ message: "No products found" });
    }

    // Adicionar o nome de usuário a cada produto antes de enviar a resposta
    let productsWithUser = await Promise.all(
      products.map(async (product) => {
        try {
          const user = await User.find(req.user).lean().exec();
          console.log(user);
          if (user.username) {
            console.log("ops");
            return { ...product, username: user.username };
          } else {
            const { user, ...productWithoutUser } = product;
            console.log(productWithoutUser);
            return { ...productWithoutUser };
          }
        } catch (error) {
          console.error(
            `Error fetching user for product ${product._id}:`,
            error
          );
        }
      })
    );

    res.json(productsWithUser);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
};

// @desc Create new product
// @route POST /products
// @access Private
const createNewProduct = async (req, res) => {
  const { user, title, text, status, price, downpayment, categories } =
    req.body;

  // Confirm data
  if (!user || !title || !text || !status) {
    return res
      .status(400)
      .json({ message: "user, title, text, status required" });
  }

  // Create and store the new user
  const product = await Product.create({
    user,
    title,
    text,
    price,
    downpayment,
    status,
    categories,
  });

  if (product) {
    // Created
    return res.status(201).json({ message: "New product created" });
  } else {
    return res.status(400).json({ message: "Invalid product data received" });
  }
};

// @desc Update a product
// @route PATCH /products
// @access Private
const updateProduct = async (req, res) => {
  const { id, title, text, status, price, downpayment, categories } = req.body;

  // Confirm data
  if (!id || !title || !text) {
    return res.status(400).json({ message: "All  fields are required" });
  }

  // Confirm product exists to update
  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  // Check for duplicate title
  // Removed

  product.title = title;
  product.status = status;
  product.text = text;
  product.downpayment = downpayment;
  product.price = price;
  product.categories = categories;

  const updatedProduct = await product.save();

  res.json(`'${updatedProduct.title}' updated`);
  console.log(`'${updatedProduct.title}' updated`);
};

// @desc Delete a product
// @route DELETE /products
// @access Private
const deleteProduct = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Product ID required" });
  }

  // Confirm product exists to delete
  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  const result = await product.deleteOne();

  const reply = `Product '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
