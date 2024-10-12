const multer = require("multer");
const path = require("path");
const bucket = require("../config/firebaseConfig"); // Firebase storage bucket configurado

// Configuração do multer para receber arquivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Função para fazer o upload de múltiplas imagens
const uploadImages = async (req, res) => {
  try {
    // Verifica se o pedido contém arquivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Nenhuma imagem foi enviada.");
    }

    const uploadedImages = [];

    // Processa cada imagem recebida
    for (const file of req.files) {
      const blob = bucket.file(`images/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Carrega a imagem no Firebase Storage
      blobStream.end(file.buffer);

      await new Promise((resolve, reject) => {
        blobStream.on("finish", () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          uploadedImages.push(publicUrl);
          resolve();
        });
        blobStream.on("error", (err) => {
          console.error("Erro no upload da imagem:", err);
          reject(err);
        });
      });
    }

    // Retorna os URLs das imagens carregadas
    res.status(200).send({ urls: uploadedImages });
  } catch (error) {
    console.error("Erro ao carregar imagens:", error);
    res.status(500).send("Erro ao carregar as imagens.");
  }
};

const deleteImages = async (req, res) => {
  try {
    const { imageUrls } = req.body; // Recebe um array de URLs de imagens

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(400).send("Nenhuma imagem foi fornecida para deletar.");
    }

    const deletedImages = [];

    // Itera sobre o array de URLs e deleta cada imagem
    for (const imageUrl of imageUrls) {
      // Extrai o nome do arquivo a partir da URL
      const imageName = imageUrl.split("/").pop();

      if (!imageName) {
        return res
          .status(400)
          .send(`Nome de imagem inválido na URL: ${imageUrl}`);
      }

      const file = bucket.file(`images/${imageName}`);

      // Deletar o arquivo do Firebase Storage
      await file.delete();
      deletedImages.push(imageName);
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

// Exporta a função deleteImages
module.exports = { upload, uploadImages, deleteImages };
