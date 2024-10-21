const Product = require("../models/Product.js");
const User = require("../models/User");
const { refresh } = require("./authController");

// @desc Get all products
// @route GET /products
// @access Private
const getAllProducts = async (req, res) => {
  try {
    // Obter todos os produtos do MongoDB
    const products = await Product.find()
      .populate("user")
      .populate("categories")
      .lean();

    // Se não encontrar produtos
    if (!products.length) {
      return res.status(400).json({ message: "No products found" });
    }

    // Adicionar o nome de usuário a cada produto antes de enviar a resposta
    const productsWithUser = await Promise.all(
      products.map(async (product) => {
        try {
          const user = await User.findById(product.user).lean().exec();
          return { ...product, username: user?.username || "Unknown" };
        } catch (error) {
          console.error(
            `Error fetching user for product ${product._id}:`,
            error
          );
          return { ...product, username: "Unknown" }; // Usar "Unknown" se o usuário não puder ser encontrado
        }
      })
    );

    return res.json(productsWithUser);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
};

// @desc Create new product
// @route POST /products
// @access Private
const createNewProduct = async (req, res) => {
  const { user, title, text, status, price, downpayment, categories, images } =
    req.body;
  if (images.length) {
    console.log(JSON.stringify(images) + "aqwuiiii");
  } else {
    console.log("sem image" + images);
  }

  // Confirm data
  if (!title || !text || !status || !user) {
    return res
      .status(400)
      .json({ message: "title, text, status, and user are required" });
  }

  // Confirm that images is an array of strings
  if (!Array.isArray(images)) {
    return res
      .status(400)
      .json({ message: "images must be an array of strings" });
  }

  // Create and store the new product
  try {
    const product = await Product.create({
      user, // Certifique-se de que este valor está correto
      title,
      text,
      price,
      downpayment,
      status,
      categories,
      images,
    });

    return res.status(201).json({ message: "New product created", product });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(400).json({ message: "Invalid product data received" });
  }
};
// @desc Update a product
// @route PATCH /products
// @access Private
const updateProduct = async (req, res) => {
  const { id, title, text, status, price, downpayment, categories, images } =
    req.body;

  // Confirm data
  if (!id || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm product exists to update
  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  // Atualizar os campos do produto
  product.title = title;
  product.status = status;
  product.text = text;
  product.downpayment = downpayment;
  product.price = price;
  product.categories = categories;
  product.images = images;
  try {
    const updatedProduct = await product.save();
    return res.json({
      message: `'${updatedProduct.title}' updated`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error(`Error updating product '${product.title}':`, error);
    return res.status(500).json({ message: "Error updating product" });
  }
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

  try {
    await product.deleteOne();
    return res.json({
      message: `Product '${product.title}' with ID ${product._id} deleted`,
    });
  } catch (error) {
    console.error(`Error deleting product '${product.title}':`, error);
    return res.status(500).json({ message: "Error deleting product" });
  }
};

module.exports = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
