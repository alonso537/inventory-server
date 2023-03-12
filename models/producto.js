const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productoSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    precioCompra: {
      type: Number,
      required: true,
    },
    precioVenta: {
      type: Number,
      required: true,
    },
    imagen: {
      type: String,
    },
    tienda: {
      type: Schema.Types.ObjectId,
      ref: "Tienda",
    },
    stock: {
      type: Number,
      required: true,
    },
    proveedor: {
      type: Schema.Types.ObjectId,
      ref: "Proveedor",
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
const Producto = mongoose.model("Producto", productoSchema);

module.exports = Producto;
