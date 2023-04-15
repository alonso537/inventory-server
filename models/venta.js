const mongoose = require("mongoose");

const VentaSchema = mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  cliente: {
    type: String,
    required: true,
  },
  productos: [
    {
      producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true,
      },
      cantidad: {
        type: Number,
        required: true,
      },
      precio: {
        type: Number,
        required: true,
      },
    },
  ],
  tienda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tienda",
  },
  estado: {
    type: String,
    enum: ["Pendiente", "Entregado", "Cancelado", "Abonado"],
    default: "Pendiente",
  },
  abonado: {
    type: Number,
    default: 0,
  },
  deuda: {
    type: Number,
    default: 0,
  },
});

const Venta = mongoose.model("Venta", VentaSchema);

module.exports = Venta;
