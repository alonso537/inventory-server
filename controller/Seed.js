const Producto = require("../models/producto");
const proveedores = require("../models/proveedores");
const { ProveedoresSeed, ProductosSeed } = require("../seed");

exports.seedProveedores = async (req, res) => {
  try {
    await proveedores.deleteMany({});
    await proveedores.insertMany(ProveedoresSeed);

    res.status(200).json("Correctamente");
  } catch (error) {
    console.log(error);
    res.status(500).json("Hubo un error");
  }
};

exports.seedProductos = async (req, res) => {
  try {
    await Producto.deleteMany({});
    await Producto.insertMany(ProductosSeed);

    res.status(200).json("subidos productos");
  } catch (error) {
    console.log(error);
    res.status(500).json("Hubo un error");
  }
};
