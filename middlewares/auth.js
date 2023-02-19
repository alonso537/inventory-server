const jwt = require("jsonwebtoken");
const Vendedores = require("../models/vendedores");

const isAutenticated = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      msg: "No hay token en la petición",
    });
  }

  // console.log(token);

  try {
    const { id } = jwt.verify(token.split(" ")[1], process.env.SECRET);
    req.user = id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      msg: "Token no válido",
    });
  }
};

const isAdmin = async (req, res, next) => {
  const vendedor = await Vendedores.findById(req.user);

  //checar que el vendedor exista
  if (!vendedor) {
    return res.status(400).json({
      msg: "El vendedor no existe",
    });
  }

  // console.log(vendedor.role === "dueño");

  //checar que el vendedor sea admin
  if (vendedor.role !== "admin") {
    return res.status(400).json({
      msg: "No tienes permisos para realizar esta acción",
    });
  }

  next();
};

const isDueno = async (req, res, next) => {
  const vendedor = await Vendedores.findById(req.user);

  //checar que el vendedor exista
  if (!vendedor) {
    return res.status(400).json({
      msg: "El vendedor no existe",
    });
  }

  // console.log(vendedor.role === "dueño");

  //checar que el vendedor sea admin
  if (vendedor.role !== "dueño") {
    return res.status(400).json({
      msg: "No tienes permisos para realizar esta acción",
    });
  }

  next();
};

module.exports = {
  isAutenticated,
  isAdmin,
  isDueno,
};
