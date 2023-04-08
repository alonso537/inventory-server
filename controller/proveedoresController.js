const proveedores = require("../models/proveedores");

exports.createProveedor = async (req, res) => {
  try {
    const { nombre, direccion, telefono, email, url } = req.body;

    //checar que no venga ningun campo vacio
    if (!nombre || !direccion || !telefono || !email || !url) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    //checar que el proveedor no exista
    const proveedorExist = await proveedores.find({ nombre });

    if (proveedorExist.length > 0) {
      return res.status(400).json({ msg: "El proveedor ya existe" });
    }

    //crear el nuevo proveedor
    const newProveedor = new proveedores({
      nombre,
      direccion,
      telefono,
      email,
      url,
      dueno: req.user,
    });

    //guardar el proveedor
    await newProveedor.save();

    //mensaje de confirmacion
    res.status(201).json({ msg: "Proveedor creado correctamente" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.getAllProveedores = async (req, res) => {
  try {
    const { nombre, limite, pagina, orden } = req.query;

    //configurar paginacion
    const limitePorPagina = parseInt(limite) || 10;
    const paginaActual = parseInt(pagina) || 1;
    const skip = (paginaActual - 1) * limitePorPagina;

    //configurar filtros
    const filtro = {};
    if (nombre) {
      filtro.nombre = { $regex: nombre, $options: "i" };
    }

    filtro.dueno = req.user;

    //configurar orden
    const ordenar = {};
    if (orden && (orden == "asc" || orden == "desc")) {
      ordenamiento.nombre = orden;
    }

    //consulta para obtener los proveedores que el dueno sea el usuario autenticado y paginacion
    const proveedoresdb = await proveedores
      .find(filtro)
      .sort(ordenar)
      .skip(skip)
      .limit(limitePorPagina);

    const totalProveedores = await proveedores.countDocuments(filtro);

    //pagina siguiente con url
    const siguiente =
      paginaActual >= Math.ceil(totalProveedores / limitePorPagina)
        ? null
        : `http://localhost:8000/api/vendedores?pagina=${paginaActual + 1}`;

    //pagina anterior
    const anterior =
      paginaActual > 1
        ? `http://localhost:8000/api/vendedores?pagina=${paginaActual - 1}`
        : null;

    //respuesta con los proveedores y paginacion
    res.status(200).json({
      totalProveedores,
      paginaActual,
      siguiente,
      anterior,
      totalPaginas: Math.ceil(totalProveedores / limitePorPagina),
      limitePorPagina,
      proveedores: proveedoresdb,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre, direccion, telefono, email, url } = req.body;

    //checar que el proveedor  exista
    const proveedorExist = await proveedores.findById({ _id: id });

    if (!proveedorExist) {
      return res.status(400).json({ msg: "El proveedor no existe" });
    }

    //actualizar el proveedor
    proveedorExist.nombre = nombre || proveedorExist.nombre;
    proveedorExist.direccion = direccion || proveedorExist.direccion;
    proveedorExist.telefono = telefono || proveedorExist.telefono;
    proveedorExist.email = email || proveedorExist.email;
    proveedorExist.url = url || proveedorExist.url;

    //guardar el proveedor
    await proveedorExist.save();

    //mensaje de confirmacion
    res.status(201).json({ msg: "Proveedor actualizado correctamente" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await proveedores.findById({ _id: id });

    if (!proveedor) {
      return res.status(400).json({ msg: "El proveedor no existe" });
    }

    await proveedor.delete();

    res.status(200).json({ msg: "Proveedor eliminado correctamente" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};
