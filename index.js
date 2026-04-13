require('dotenv').config();
require('reflect-metadata');
const express = require('express')
const routes = require('./src/routers')
const AppDataSource = require("./src/config/data-source");
const User = require("./src/models/user.model");
const cors = require("cors")

const app = express()
const port = 3000

app.use(cors()); 

app.use(express.json());

app.use('/api', routes)

AppDataSource.initialize()
  .then(async () => {
    console.log("Base de datos conectada");

    const userRepository = AppDataSource.getRepository(User);

    try {
      const adminCount = await userRepository.count({ where: { role: 'ADMIN' } });

      if (adminCount === 0) {
        const name = process.env.ADMIN_NAME || 'Admin';
        const lastname = process.env.ADMIN_LASTNAME || 'Principal';
        const document = process.env.ADMIN_DOCUMENT || '100';
        const password = process.env.ADMIN_PASSWORD || '100';

        await userRepository.save({
          name,
          lastname,
          document,
          password,
          role: 'ADMIN',
        });

        console.log(`ADMIN creado automaticamente (document: ${document})`);
      }
    } catch (err) {
      console.log('Error creando ADMIN automaticamente:', err.message);
    }

    app.listen(port, () => {
      console.log(`Servidor corriendo en puerto ${port}`);
    });
  })
  .catch((error) => console.log(error));
