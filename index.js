require('dotenv').config()
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB conectada');
    app.listen(PORT, () => console.log('Servidor en puerto', PORT));
  })
  .catch((err) => console.error('Error DB:', err));
