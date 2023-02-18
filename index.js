import express from "express";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
