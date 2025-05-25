const express = require('express');
const cors = require('cors');
const usuarios = require('./Users');
const proyectos = require('./Proyectos');
const reportes = require('./Reportes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', usuarios);
app.use('/api/proyectos', proyectos);
app.use("/api/reportes", reportes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
