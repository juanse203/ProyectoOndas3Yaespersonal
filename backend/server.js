const express = require('express');
const cors = require('cors');
const usuarios = require('./Users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', usuarios);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
