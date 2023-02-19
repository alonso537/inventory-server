const mongoose = require("mongoose");

const tiendasSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: Number, required: true },
    estado: { type: Boolean, default: true },
    foto: { type: String },
    vendedores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendedores" }],
    productos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Productos" }],
    compras: [{ type: mongoose.Schema.Types.ObjectId, ref: "Compras" }],
    ventas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ventas" }],
    dueno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendedores",
      required: true,
    },
    categoria: { type: String, required: true },

    descripcion: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Tiendas = mongoose.model("Tiendas", tiendasSchema);

module.exports = Tiendas;
