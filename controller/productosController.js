const Producto = require("../models/producto");
const Vendedores = require("../models/vendedores");
const { eliminarImagen, subirImagen } = require("../utils/Cloudinary");

exports.createProduct = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      precioVenta,
      precioCompra,
      tienda,
      stock,
      proveedor,
    } = req.body;

    if (
      !titulo ||
      !descripcion ||
      !precioVenta ||
      !precioCompra ||
      !tienda ||
      !stock ||
      !proveedor
    ) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    // Verificar que el producto no exista cons el titulo
    const productoExist = await Producto.findOne({ titulo });

    if (productoExist) {
      return res.status(400).json({ msg: "El producto ya existe" });
    }

    const producto = new Producto(req.body);

    await producto.save();

    res.status(201).json({ msg: "Producto creado correctamente" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { page, limit, titulo, descripcion, proveedor } = req.query;

    // Configurar paginacion
    const limitPerPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * limitPerPage;

    // Configurar filtros
    const filter = {};

    if (titulo) {
      filter.titulo = { $regex: titulo, $options: "i" };
    }

    if (descripcion) {
      filter.descripcion = { $regex: descripcion, $options: "i" };
    }

    if (proveedor) {
      filter.proveedor = { $regex: proveedor, $options: "i" };
    }

    const userDb = await Vendedores.findById(req.user);

    filter.tienda = userDb.tienda;
    // console.log(filter);

    // Obtener productos filtrando la tienda del usuario logueado y agregar ordering en precio y titulo
    const productos = await Producto.find(filter)
      .populate("proveedor", "nombre")
      .sort({ createdAt: -1 })
      .sort({ precioVenta: 1 })
      .sort({ titulo: 1 })
      .skip(skip)
      .limit(limitPerPage);

    // console.log(productos);

    // Obtener el total de productos
    const totalProductos = await Producto.countDocuments(filter);

    //pagina siguiente con url
    const siguiente =
      currentPage >= Math.ceil(totalProductos / limitPerPage)
        ? null
        : `http://localhost:3000/api/productos?page=${
            currentPage + 1
          }&limit=${limitPerPage}`;

    //pagina anterior con url
    const anterior =
      currentPage <= 1
        ? null
        : `http://localhost:3000/api/productos?page=${
            currentPage - 1
          }&limit=${limitPerPage}`;

    //respuenta con paginacion y productos
    res.status(200).json({
      totalProductos,
      paginaActual: currentPage,
      siguiente,
      anterior,
      totalPaginas: Math.ceil(totalProductos / limitPerPage),
      limitePorPagina: limitPerPage,
      productos,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Producto.findById(id);

    if (!product) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const { id } = req.params;

    const { imagen } = req.files;

    const product = await Producto.findById(id);

    if (!product) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    if (product.imagen) {
      const nombreArr = product.imagen.split("/");
      const nombreExtension = nombreArr[nombreArr.length - 1];
      const public_url = nombreExtension.split(".")[0];

      const result = await eliminarImagen(public_url);

      if (!result) {
        return res.status(400).json({ msg: "Error al eliminar imagen" });
      }
    }

    const result = await subirImagen(imagen.tempFilePath);

    if (!result) {
      return res.status(400).json({ msg: "Error al subir imagen" });
    }

    product.imagen = result;

    await product.save();

    res.status(200).json({ msg: "Imagen subida correctamente" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      precioVenta,
      precioCompra,
      stock,
      proveedor,
      estado,
    } = req.body;

    const product = await Producto.findById(id);

    if (!product) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    product.titulo = titulo || product.titulo;
    product.descripcion = descripcion || product.descripcion;
    product.precioVenta = precioVenta || product.precioVenta;
    product.precioCompra = precioCompra || product.precioCompra;
    product.stock = stock || product.stock;
    product.proveedor = proveedor || product.proveedor;
    product.estado = estado || product.estado;

    await product.save();

    res.status(200).json({ msg: "Producto actualizado correctamente" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Producto.findById(id);

    if (!product) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    if (product.imagen) {
      const nombreArr = product.imagen.split("/");
      const nombreExtension = nombreArr[nombreArr.length - 1];
      const public_url = nombreExtension.split(".")[0];

      const result = await eliminarImagen(public_url);

      if (!result) {
        return res.status(400).json({ msg: "Error al eliminar imagen" });
      }
    }

    await Producto.findByIdAndDelete(id);

    res.status(200).json({ msg: "Producto eliminado correctamente" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      msg: "hubo un error",
    });
  }
};
