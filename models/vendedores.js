const mongoose = require("mongoose");

const vendedoresSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: Number },
    comision: { type: Number, default: 0 },
    estado: { type: Boolean, default: true },
    foto: { type: String },
    password: { type: String, required: true },
    tienda: { type: mongoose.Schema.Types.ObjectId, ref: "Tiendas" },
    role: {
      type: String,
      enum: ["admin", "dueño", "vendedor"],
      default: "vendedor",
    },
  },
  {
    timestamps: true,
  },
);

const Vendedores = mongoose.model("Vendedores", vendedoresSchema);

module.exports = Vendedores;
