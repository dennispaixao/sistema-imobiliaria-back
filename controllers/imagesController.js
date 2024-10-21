const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig"); // Cloudinary configurado
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuração do multer para receber arquivos e armazená-los diretamente no Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // Pasta onde as imagens serão armazenadas no Cloudinary
    format: async (req, file) => path.extname(file.originalname).slice(1), // Mantém a extensão original
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});
const upload = multer({ storage });

// Função para fazer o upload de múltiplas imagens
const uploadImages = async (req, res) => {
  try {
    // Verifica se o pedido contém arquivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Nenhuma imagem foi enviada.");
    }

    // Array para armazenar URLs das imagens carregadas
    const uploadedImages = [];

    // Faz o upload de cada imagem para o Cloudinary
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      uploadedImages.push(result.secure_url); // Armazena a URL segura da imagem
    }

    // Retorna os URLs das imagens carregadas
    res.status(200).send({ urls: uploadedImages });
  } catch (error) {
    console.error("Erro ao carregar imagens:", error);
    res.status(500).send("Erro ao carregar as imagens.");
  }
};

// Função para deletar múltiplas imagens
const deleteImages = async (req, res) => {
  try {
    const { imageUrls } = req.body;
    console.log(
      "Images recebidas >>>>>>>>",
      imageUrls ? imageUrls : "não há imagens"
    );

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(400).send("Nenhuma imagem foi fornecida para deletar.");
    }

    const deletedImages = [];
    for (const imageUrl of imageUrls) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      console.log("publicId extraído >>>>>>>>", publicId);

      try {
        // Adicionando a invalidação do cache
        const result = await cloudinary.api.delete_resources([publicId], {
          invalidate: true,
        });
        console.log(`Resultado da exclusão da imagem ${publicId}:`, result);

        if (result.result === "ok") {
          deletedImages.push(publicId);
        } else {
          console.error(`Erro ao deletar imagem: ${imageUrl}`, result);
        }
      } catch (deleteError) {
        console.error("Erro ao deletar a imagem:", deleteError);
      }
    }

    res.status(200).send({
      message: "Imagens deletadas com sucesso.",
      deletedImages,
    });
  } catch (error) {
    console.error("Erro ao deletar as imagens:", error);
    res.status(500).send("Erro ao deletar as imagens.");
  }
};

// Exporta as funções
module.exports = { upload, uploadImages, deleteImages };
