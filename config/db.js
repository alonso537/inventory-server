const mongoose = require("mongoose");

const conectarDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB conectada");
  } catch (error) {
    console.log(error);
    process.exit(1); //Detener la app
  }
};

module.exports = conectarDb;
