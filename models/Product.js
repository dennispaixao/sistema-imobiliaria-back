const mongoose = require("mongoose");
AutoIncrement = require("mongoose-sequence")(mongoose);
const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Categorie",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
    },
    downpayment: {
      type: mongoose.Schema.Types.Decimal128,
    },
    status: {
      type: Number, //0 excluido 1 à venda 2 vendido
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});

module.exports = mongoose.model("Product", productSchema);
