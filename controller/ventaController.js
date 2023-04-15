const Producto = require("../models/producto");
const Venta = require("../models/venta");
const Excel = require("exceljs");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const Vendedores = require("../models/vendedores");

exports.crearVenta = async (req, res) => {
  try {
    //obtener los datos del body
    const { cliente, productos } = req.body;

    //obtener el id del usuario
    const user = await Vendedores.findById(req.user).select("-password");

    console.log(user);

    //checar que no haya campos vacios
    if (!cliente || !productos) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    //crear fecha
    const fechaVenta = Date.now();

    //checar que la fecha sea valida
    if (isNaN(fechaVenta)) {
      return res.status(400).json({ msg: "Fecha no válida" });
    }

    //recorrer los productos para verificar que tengan cantidad y precio y calcular el total y restar la cantidad de productos vendidos al inventario
    let total = 0;
    for (let i = 0; i < productos.length; i++) {
      const { cantidad, precio } = productos[i];
      if (!cantidad || !precio) {
        return res
          .status(400)
          .json({ msg: "Todos los campos son obligatorios" });
      }

      total += cantidad * precio;

      //restar la cantidad de productos vendidos al inventario
      const producto = await Producto.findById(productos[i].producto);
      producto.stock -= cantidad;
      await producto.save();
    }

    //crear nueva venta
    const venta = new Venta({
      fecha: fechaVenta,
      total,
      cliente,
      productos,
      tienda: user.tienda,
    });

    //guardar venta
    await venta.save();

    //mensaje de exito
    res.status(201).json({ msg: "Venta creada correctamente", venta });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.getAllVentas = async (req, res) => {
  try {
    const user = await Vendedores.findById(req.user).select("-password");

    console.log(user.tienda);

    //obtener las ventas y nadamas mostrar las de la tienda del usuario
    const ventas = await Venta.find({ tienda: user.tienda }).sort({
      fecha: -1,
    });

    // console.log(ventas.tienda === req.user.tienda);
    //si no hay ventas
    if (ventas.length === 0) {
      return res.status(400).json({ msg: "No hay ventas" });
    }

    res.status(200).json({ ventas });
  } catch (error) {
    // console.log(error);
    res.status(500).json("Hubo un error");
  }
};

exports.changeEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // console.log(estado);
    // console.log(req.body);

    //obtener la venta por el id y la tienda del usuario
    const venta = await Venta.findById(id);

    if (!venta) {
      return res.status(400).json({ msg: "No existe la venta" });
    }

    //si el estado es diferente a Pendiente ya no se puede cambiar
    if (
      venta.estado === "Entregado" ||
      venta.estado === "Cancelado" ||
      venta.estado === "Abonado"
    ) {
      return res.status(400).json({ msg: "No se puede cambiar el estado" });
    }

    if (estado === "Entregado") {
      //actualizar el campo de deuda con el total de la venta y el campo de total de la venta es igual al campo de abono
      venta.total = venta.deuda;
      venta.deuda = 0;
      venta.abonado = 0;

      venta.estado = estado;

      //guardar la venta
      await venta.save();

      //mensaje de exito
      return res.status(200).json({ msg: "Venta actualizada correctamente" });
    }

    if (estado === "Abonado") {
      //actualizar el campo de deuda con el total de la venta y el campo de total de la venta es igual al campo de abono
      venta.deuda = venta.total;
      venta.total = venta.abonado;

      venta.estado = estado;
      //guardar la venta
      await venta.save();

      //mensaje de exito
      return res.status(200).json({ msg: "Venta actualizada correctamente" });
    }

    //cambiar el estado
    venta.estado = estado;

    //guardar la venta
    await venta.save();

    //mensaje de exito
  } catch (error) {
    console.log(error);
    res.status(500).json("Hubo un error");
  }
};

exports.obtenerPorcentaje = async (req, res) => {
  try {
    const user = await Vendedores.findById(req.user).select("-password");
    const ventas = await Venta.find({ tienda: user.tienda }).sort({
      fecha: -1,
    });

    if (ventas.estado == "Pendiente" && ventas.estado == "Cancelada") {
      return res.status(400).json({ msg: "No hay ventas" });
    }

    //obtener el total de ventas de mes anterior y mes actual lo que valla vendiendo
    const mesActual = new Date().getMonth() + 1;
    const mesAnterior = mesActual - 1;

    let totalMesActual = 0;
    let totalMesAnterior = 0;

    // console.log(mesActual);
    // console.log(mesAnterior);

    ventas.forEach((venta) => {
      // console.log(venta.fecha);
      // console.log(venta.fecha.getMonth() + 1);
      const fecha = new Date(venta.fecha);
      const mes = fecha.getMonth() + 1;
      // console.log(mes);

      //obtener las ventas del mes actual
      if (mes === mesActual) {
        //solo si el estado es igual a Entregado
        if (venta.estado === "Entregado") {
          totalMesActual += venta.total;
        }
      }

      //obtener las ventas del mes anterior y si no hay ventas que ponga 0
      if (mes === mesAnterior) {
        //solo si el estado es igual a Entregado
        if (venta.estado === "Entregado") {
          totalMesAnterior += venta.total ? venta.total : 0;
        }
      }
    });

    // console.log(totalMesActual);
    // console.log(totalMesAnterior);

    //calcular el ventas del mes anterior y el mes actual y saber cuanto porcentaje de venta se aumento o disminuyo
    let porcentaje = 0;
    if (totalMesAnterior === 0) {
      porcentaje = 100;
    } else {
      porcentaje =
        ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100;
    }

    res.status(200).json({ porcentaje });
  } catch (error) {
    // console.log(error);
    res.status(500).json("Hubo un error");
  }
};

exports.getTotalVentasporMes = async (req, res) => {
  try {
    //obtener las ventas y listarlas por mes para graficar por tienda del usuario
    const user = await Vendedores.findById(req.user).select("-password");
    const ventas = await Venta.find({ tienda: user.tienda }).sort({
      fecha: -1,
    });

    //obtener todos los meses de un año
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    //crear un arreglo con los meses y el total de ventas de cada mes
    const totalVentas = [];
    meses.forEach((mes) => {
      totalVentas.push({
        mes,
        total: 0,
      });
    });

    // console.log(ventas);

    if (ventas.length === 0) {
      return res.status(400).json({ msg: "No hay ventas" });
    }

    //recorrer las ventas y sumar el total de ventas por mes y solo por la tienda del usuario
    ventas.forEach((venta) => {
      //solo si el estado es igual a Entregado
      if (venta.estado === "Entregado") {
        const fecha = new Date(venta.fecha);
        const mes = fecha.getMonth();
        totalVentas[mes].total += venta.total;
      }
    });

    res.status(200).json({ totalVentas });
  } catch (error) {
    // console.log(error);
    res.status(500).json("Hubo un error");
  }
};

exports.createExcelMensual = async (req, res) => {
  try {
    //obtener las ventas
    const ventas = await Venta.find();

    //crear el archivo excel
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Ventas");

    //crear encabezados
    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 30 },
      { header: "Total", key: "total", width: 10 },
      { header: "Cliente", key: "cliente", width: 30 },
      { header: "Estado", key: "estado", width: 10 },
    ];

    //agregar datos
    ventas.forEach((venta) => {
      worksheet.addRow({
        fecha: moment(venta.fecha).format("DD/MM/YYYY"),
        total: venta.total,
        cliente: venta.cliente,
        estado: venta.estado,
      });
    });

    //guardar el archivo
    const fileName = `Ventas.xlsx`;

    //si no existe la carpeta publica la crea
    if (!fs.existsSync(path.join(__dirname, "../public"))) {
      fs.mkdirSync(path.join(__dirname, "../public"));
    }

    //si ya existe el archivo lo elimina
    if (fs.existsSync(path.join(__dirname, `../public/${fileName}`))) {
      fs.unlinkSync(path.join(__dirname, `../public/${fileName}`));
    }

    const filePath = path.join(__dirname, `../public/${fileName}`);

    await workbook.xlsx.writeFile(filePath);

    res
      .status(200)
      .json({ msg: "Archivo creado correctamente", fileName, filePath });
  } catch (error) {
    // console.log(error);
    res.status(500).json("Hubo un error");
  }
};

exports.obtenerInvertido = async (req, res) => {
  try {
    const { user } = req;

    const vendedor = await Vendedores.findById(user).select("-password");
    // console.log(vendedor);

    //obtener todos los productos de la tienda del usuario
    const productos = await Producto.find({ tienda: vendedor.tienda });
    console.log(productos.length);

    //obtener el total invertido en productos usando el precioCompra
    let totalInvertido = 0;
    productos.forEach((producto) => {
      totalInvertido += producto.precioCompra;
    });

    res.status(200).json({ totalInvertido });
  } catch (error) {
    console.log(error);
    res.status(500).json("Hubo un error");
  }
};

exports.addAbono = async (req, res) => {
  try {
    const { id } = req.params;

    //obtener la venta
    const venta = await Venta.findById(id);

    //obtener el abono
    const { abono } = req.body;

    //sumar el abono a la venta y restar el abono al total
    venta.abonado += abono;
    venta.deuda -= abono;
    venta.total = venta.abonado;

    //si la deuda es igual a 0 cambiar el estado a Entregado
    if (venta.deuda === 0) {
      venta.estado = "Entregado";
    }

    //guardar la venta
    await venta.save();

    res.status(200).json({ msg: "Abono agregado correctamente" });
  } catch (error) {
    console.log(error);
  }
};
