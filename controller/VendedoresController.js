const Vendedores = require("../models/vendedores");
const bcryptjs = require("bcryptjs");
const { parse } = require("dotenv");
const Tiendas = require("../models/tienda");
const { subirImagen, eliminarImagen } = require("../utils/Cloudinary");

exports.createVendedor = async (req, res) => {
  try {
    const { nombre, apellido, username, email, telefono, password } = req.body;

    const { user } = req;

    // console.log(user);

    const userDb = await Vendedores.findById({ _id: user });

    // console.log(userDb);

    //checar que vengan todos los campos menos telefono y foto
    if (!nombre || !apellido || !username || !email || !password) {
      return res.status(400).json({
        msg: `Todos los campos son obligatorios, excepto telefono y foto`,
      });
    }

    const tiendaId = await Tiendas.findById({ _id: userDb.tienda });
    //checar que el vendedore no exista en la tienda
    const vendedor = await Vendedores.findOne({
      $and: [{ username, nombre, apellido }, { tienda: tiendaId }],
    });

    if (vendedor) {
      return res.status(400).json({
        msg: "El vendedor ya existe",
      });
    }

    //obtener el id de la tienda

    //hashear el password
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);

    //crear el vendedor
    const nuevoVendedor = new Vendedores({
      nombre,
      apellido,
      username,
      email,
      telefono,
      password: hash,
      tienda: tiendaId,
    });

    //guardar el vendedor
    await nuevoVendedor.save();

    //actualizar la tienda y agregar el vendedor
    await Tiendas.findByIdAndUpdate(tiendaId, {
      $push: { vendedores: nuevoVendedor._id },
    });

    //mensaje de confirmacion
    res.status(201).json({
      msg: "Vendedor creado correctamente",
      vendedor: {
        nombre: nuevoVendedor.nombre,
        apellido: nuevoVendedor.apellido,
        username: nuevoVendedor.username,
        email: nuevoVendedor.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hubo un error",
    });
  }
};

exports.getAllVendedores = async (req, res) => {
  //obtener al dueaño de la tienda

  try {
    const {
      nombre,
      apellido,
      username,

      estado,
      pagina,
      limite,
      orden,
    } = req.query;

    // console.log(req.user);
    const dueno = await Vendedores.findById({ _id: req.user });

    if (!dueno.tienda) {
      return res.status(200).json({
        msg: "No tienes tienda",
      });
    }

    //configurar paginacion
    const paginaActual = parseInt(pagina) || 1;
    const limitePorPagina = parseInt(limite) || 10;
    const skip = (paginaActual - 1) * limitePorPagina;

    //configurar filtros
    const filtro = {};
    if (nombre) {
      filtro.nombre = { $regex: nombre, $options: "i" };
    }
    if (apellido) {
      filtro.apellido = { $regex: apellido, $options: "i" };
    }
    if (username) {
      filtro.username = { $regex: username, $options: "i" };
    }

    if (estado) {
      filtro.estado = estado;
    }

    // filtro.tienda = tiendaUsuario._id;
    filtro.tienda = dueno.tienda;

    // console.log(dueno);
    // console.log(filtro);
    //configuracion de ordenamiento
    const ordenamiento = {};
    if (orden && (orden == "asc" || orden == "desc")) {
      ordenamiento.nombre = orden;
    }

    //consulta para obtener vendedores con filtros , paginacion y ordenamiento y populate filtrar por tienda
    const vendedores = await Vendedores.find(filtro)
      // .sort($or)

      .skip(skip)
      .limit(limitePorPagina)
      .sort(ordenamiento)
      .populate("tienda", "nombre");

    //consulta para obtener el total de vendedores

    const totalVendedores = await Vendedores.countDocuments(filtro);

    //pagina siguiente con url
    const siguiente =
      paginaActual >= Math.ceil(totalVendedores / limitePorPagina)
        ? null
        : `http://localhost:8000/api/vendedores?pagina=${paginaActual + 1}`;

    //pagina anterior
    const anterior =
      paginaActual > 1
        ? `http://localhost:8000/api/vendedores?pagina=${paginaActual - 1}`
        : null;

    //respuesta con vendedores y datos de paginacion
    res.status(200).json({
      paginaActual,
      totalVendedores,
      totalPaginas: Math.ceil(totalVendedores / limitePorPagina),
      limitePorPagina,
      siguiente,
      anterior,
      vendedores,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hubo un error",
    });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.files);
    // console.log(req.body);
    const { foto } = req.files;

    // console.log(foto.tempFilePath);

    // tempFilePath

    //obtener el vendedor
    const vendedor = await Vendedores.findById({ _id: id });

    if (!vendedor) {
      return res.status(404).json({
        msg: "El vendedor no existe",
      });
    }

    //checar si el vendedor ya tiene foto si es asi eliminar la antigua
    if (vendedor.foto) {
      const nombreArr = vendedor.foto.split("/");
      const nombreExtension = nombreArr[nombreArr.length - 1];
      const public_url = nombreExtension.split(".")[0];
      // console.log(public_url);

      const result = await eliminarImagen(public_url);

      // console.log(result);

      if (!result)
        return res.status(400).json({
          msg: "No se pudo eliminar la imagen",
        });
    }

    const fotoDb = await subirImagen(foto.tempFilePath);

    vendedor.foto = fotoDb;

    await vendedor.save();

    res.status(200).json({
      vendedor,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "Hubo un error",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    //obtener el vendedor
    const vendedor = await Vendedores.findById({ _id: id });

    if (!vendedor) {
      return res.status(404).json({
        msg: "El vendedor no existe",
      });
    }

    //obtener los datos del body
    const { nombre, apellido, username, email, telefono, password } = req.body;

    //actualizar los datos
    vendedor.nombre = nombre || vendedor.nombre;
    vendedor.apellido = apellido || vendedor.apellido;
    vendedor.username = username || vendedor.username;
    vendedor.email = email || vendedor.email;
    vendedor.telefono = telefono || vendedor.telefono;
    vendedor.password = password || vendedor.password;

    //guardar los cambios
    await vendedor.save();

    res.status(200).json({
      msg: "Vendedor actualizado correctamente",
      vendedor,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "Hubo un error",
    });
  }
};

exports.deleteVendedor = async (req, res) => {
  try {
    const { id } = req.params;

    //obtener el vendedor
    const vendedor = await Vendedores.findById({ _id: id });

    //obtener tienda en la que esta el vendedor
    const tienda = await Tiendas.findById({ _id: vendedor.tienda.toString() });

    if (!vendedor) {
      return res.status(404).json({
        msg: "El vendedor no existe",
      });
    }

    //eliminar la foto del vendedor
    if (vendedor.foto) {
      const nombreArr = vendedor.foto.split("/");
      const nombreExtension = nombreArr[nombreArr.length - 1];
      const public_url = nombreExtension.split(".")[0];
      // console.log(public_url);

      const result = await eliminarImagen(public_url);

      // console.log(result);

      if (!result)
        return res.status(400).json({
          msg: "No se pudo eliminar la imagen",
        });
    }

    //eliminar el vendedor de la tienda
    const vendedoreIntienda = tienda.vendedores.filter(
      (vendedor) => vendedor.toString() !== id,
    );

    tienda.vendedores = vendedoreIntienda;

    await tienda.save();

    //eliminar el vendedor
    await vendedor.delete();

    res.status(200).json({
      msg: "Vendedor eliminado correctamente",
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "Hubo un error",
    });
  }
};
