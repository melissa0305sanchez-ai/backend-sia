const express = require('express')
const routes = require('./src/routers')
const AppDataSource = require("./src/config/data-source");
const cors = require("cors")

const app = express()
const port = 3000

app.use(cors()); 

app.use(express.json());

app.use('/api', routes)

AppDataSource.initialize()
  .then(() => {
    console.log("Base de datos conectada");

    app.listen(port, () => {
      console.log(`Servidor corriendo en puerto ${port}`);
    });
  })
  .catch((error) => console.log(error));
