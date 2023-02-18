import mongoose from "mongoose";

const vendedoresSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: Number, required: true },
    comision: { type: Number, default: 0 },
    estado: { type: String, required: true },
    foto: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Vendedores = mongoose.model("Vendedores", vendedoresSchema);

export default Vendedores;
