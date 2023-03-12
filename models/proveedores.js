const mongoose = require("mongoose");

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    dueno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendedor",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Proveedor", proveedorSchema);
