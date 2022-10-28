const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// criando a collection chamada Category
const categoria = mongoose.model("Categoria", categorySchema);

// e aqui vamos exportar esse modulo
module.exports = categoria;
