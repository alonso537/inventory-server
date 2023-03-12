const Vendedores = require("../models/vendedores");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    //checar que los campos no esten vacios
    if (!username || !password) {
      return res.status(400).json({
        msg: "Todos los campos son obligatorios",
      });
    }

    //checar que el vendedor exista
    const vendedor = await Vendedores.findOne({ username });

    if (!vendedor) {
      return res.status(400).json({
        msg: "El vendedor no existe",
      });
    }

    //checar que el password sea correcto
    const passCorrecto = await bcryptjs.compare(password, vendedor.password);
    if (!passCorrecto) {
      return res.status(400).json({
        msg: "Password incorrecto",
      });
    }

    //firmar el token por 30 dias
    const token = jwt.sign(
      {
        id: vendedor._id,
      },
      process.env.SECRET,
      {
        expiresIn: "30d",
      },
    );

    //mensaje de confirmacion
    res.status(200).json({
      msg: "Login correcto",
      token,
      vendedor,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre, apellido, username, email, password } = req.body;

    //checar que los campos no esten vacios
    if (!nombre || !apellido || !username || !email || !password) {
      return res.status(400).json({
        msg: "Todos los campos son obligatorios",
      });
    }

    //checar que el vendedor no exista

    const vendedorExist = await Vendedores.findOne({
      $or: [{ username }, { email }],
    });

    if (vendedorExist) {
      return res.status(400).json({
        msg: "El vendedor ya existe",
      });
    }

    //encriptar el password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    //crear el nuevo vendedor
    const vendedor = new Vendedores({
      nombre,
      apellido,
      username,
      email,
      password: passwordHash,
      role: "dueño",
    });

    //guardar el vendedor
    await vendedor.save();

    //firmar el token por 30 dias
    const token = jwt.sign(
      {
        id: vendedor._id,
      },
      process.env.SECRET,
      {
        expiresIn: "30d",
      },
    );

    //mensaje de confirmacion
    res.status(200).json({
      msg: "Registro correcto",
      token,
      vendedor,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const vendedor = await Vendedores.findById(req.user).select("-password");

    // console.log(vendedor);
    //checar que el vendedor exista
    if (!vendedor) {
      return res.status(400).json({
        msg: "El vendedor no existe",
      });
    }

    //mensaje de confirmacion
    res.status(200).json({
      vendedor,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};
