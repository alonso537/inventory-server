const Tiendas = require("../models/tienda");
const Vendedores = require("../models/vendedores");
const { eliminarImagen, subirImagen } = require("../utils/Cloudinary");

exports.createTienda = async (req, res) => {
  try {
    const { nombre, descripcion, direccion, telefono, categoria, dueno } =
      req.body;

    //checar que los campos no esten vacios
    if (!nombre || !descripcion || !direccion || !telefono || !categoria) {
      return res.status(400).json({
        msg: "Todos los campos son obligatorios",
      });
    }

    //checar que la tienda no exista
    const tienda = await Tiendas.findOne({ nombre });
    if (tienda) {
      return res.status(400).json({
        msg: "La tienda ya existe",
      });
    }

    //obtener el id del dueño
    const dueñoId = await Vendedores.findById({ _id: dueno });

    //crear la tienda
    const nuevaTienda = new Tiendas({
      nombre,
      descripcion,
      direccion,
      telefono,
      categoria,
      dueno: dueñoId,
    });

    //guardar la tienda
    await nuevaTienda.save();

    //actualizar el dueño y agregar la tienda
    await Vendedores.findByIdAndUpdate(
      { _id: dueno },
      { $push: { tienda: nuevaTienda._id } },
    );

    //mensaje de confirmacion
    res.status(200).json({
      msg: "Tienda creada correctamente",
      nuevaTienda,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.getMyTienda = async (req, res) => {
  try {
    const vendedor = await Vendedores.findById({ _id: req.user });

    // console.log(vendedor);

    if (!vendedor?.tienda) {
      return res.status(200).json({
        msg: "No tienes tienda",
      });
    }

    const tienda = await Tiendas.findById();

    // console.log(tienda);

    // const tienda = await Tiendas.findOne({ dueno: req.user });
    res.status(200).json({
      tienda,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.getAllTiendas = async (req, res) => {
  try {
    const tiendas = await Tiendas.find();

    res.status(200).json({
      tiendas,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.updateFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const { foto } = req.files;

    // console.log(req.files);

    const tienda = await Tiendas.findById(id);

    if (!tienda) {
      return res.status(400).json({
        msg: "La tienda no existe",
      });
    }

    if (tienda.foto) {
      const nombreArr = tienda.foto.split("/");
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

    const result = await subirImagen(foto.tempFilePath);

    tienda.foto = result;

    await tienda.save();

    res.status(200).json({
      tienda,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.updateTienda = async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre, descripcion, direccion, telefono, categoria } = req.body;

    const tienda = await Tiendas.findById(id);

    if (!tienda) {
      return res.status(400).json({
        msg: "La tienda no existe",
      });
    }

    tienda.nombre = nombre || tienda.nombre;
    tienda.descripcion = descripcion || tienda.descripcion;
    tienda.direccion = direccion || tienda.direccion;
    tienda.telefono = telefono || tienda.telefono;
    tienda.categoria = categoria || tienda.categoria;

    await tienda.save();

    res.status(200).json({
      tienda,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.deleteTienda = async (req, res) => {
  try {
    const { id } = req.params;

    const tienda = await Tiendas.findById(id);

    if (!tienda) {
      return res.status(400).json({
        msg: "La tienda no existe",
      });
    }

    //obtener vendedores de la tienda
    const vendedores = await Vendedores.find({ tienda: id });

    // console.log(vendedores);

    //eliminar tienda de los vendedores
    vendedores.forEach(async (vendedor) => {
      await Vendedores.findByIdAndUpdate(
        { _id: vendedor._id },
        { $pull: { tienda: "" } },
      );
    });

    if (tienda.foto) {
      const nombreArr = tienda.foto.split("/");
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

    await Tiendas.findByIdAndDelete(id);

    res.status(200).json({
      msg: "Tienda eliminada correctamente",
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};
