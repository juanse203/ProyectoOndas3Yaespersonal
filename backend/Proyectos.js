const express = require('express');
const router = express.Router();
const { db } = require('./firebaseAdmin');
const { v4: uuidv4 } = require('uuid');

//Crear proyecto
router.post('/crear', async (req, res) => {
  const {
    titulo,
    area,
    objetivos,
    cronograma,
    presupuesto,
    institucion,
    integrantes,
    observaciones,
    creadorId,
    profesorId
  } = req.body;

  try {
    const proyectoId = uuidv4();
    await db.collection('proyectos').doc(proyectoId).set({
      proyectoId,
      titulo,
      area,
      objetivos,
      cronograma,
      presupuesto,
      institucion,
      integrantes,
      observaciones,
      creadorId,
      profesorId,
      estadoActual: 'Formulación',
      historialEstados: [
        {
          estado: 'Formulación',
          fecha: new Date().toISOString(),
          observacion: 'Proyecto creado'
        }
      ],
      avances: []
    });

    res.status(201).json({ message: 'Proyecto creado correctamente' });
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({ error: 'Error interno al crear el proyecto' });
  }
});

module.exports = router;

// Estoy registrando avances
router.post('/avance/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  const { descripcion, fecha, documentos = [], fotografias = [] } = req.body;

  try {
    const proyectoRef = db.collection('proyectos').doc(proyectoId);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const nuevoAvance = {
      fecha,
      descripcion,
      documentos,
      fotografias
    };

    await proyectoRef.update({
      avances: [...(proyectoDoc.data().avances || []), nuevoAvance]
    });

    res.status(200).json({ message: 'Avance registrado correctamente' });
  } catch (error) {
    console.error("Error al registrar avance:", error);
    res.status(500).json({ error: 'Error interno al registrar avance' });
  }
});

//  El estado del proyecto
router.post('/estado/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  const { nuevoEstado, observacion } = req.body;

  try {
    const proyectoRef = db.collection('proyectos').doc(proyectoId);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const historial = proyectoDoc.data().historialEstados || [];

    await proyectoRef.update({
      estadoActual: nuevoEstado,
      historialEstados: [...historial, {
        estado: nuevoEstado,
        fecha: new Date().toISOString(),
        observacion
      }]
    });

    res.status(200).json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ error: 'Error interno al cambiar estado' });
  }
});

// Lista de proyectos
router.get('/listar', async (req, res) => {
  try {
    const snapshot = await db.collection('proyectos').get();
    const proyectos = snapshot.docs.map(doc => doc.data());

    res.status(200).json(proyectos);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// Detalles del proyecto
router.get('/detalle/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;

  try {
    const proyectoDoc = await db.collection('proyectos').doc(proyectoId).get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    let proyectoData = proyectoDoc.data();

    // Fetch professor details if profesorId exists
    if (proyectoData.profesorId) {
      const profesorRef = db.collection('usuarios').doc(proyectoData.profesorId);
      const profesorDoc = await profesorRef.get();
      if (profesorDoc.exists && profesorDoc.data().rol === 'Profesor') { 
        proyectoData.profesor = {
          nombre: profesorDoc.data().nombre,
          apellido: profesorDoc.data().apellido,
          id: profesorDoc.id
        };
      } else {
        proyectoData.profesor = { nombre: "Profesor no encontrado", apellido: "" };
      }
    } else {
        proyectoData.profesor = null; 
    }


    // Fetch student details if 'integrantes' array exists
    if (proyectoData.integrantes && Array.isArray(proyectoData.integrantes) && proyectoData.integrantes.length > 0) {
      const estudiantesPromises = proyectoData.integrantes.map(async (integranteId) => {
        const estudianteRef = db.collection('usuarios').doc(integranteId);
        const estudianteDoc = await estudianteRef.get();
        if (estudianteDoc.exists && estudianteDoc.data().rol === 'Estudiante') { 
          return {
            id: estudianteDoc.id,
            nombre: estudianteDoc.data().nombre,
            apellido: estudianteDoc.data().apellido
          };
        }
        return {
            id: integranteId, // Keep the ID even if user not found, for reference
            nombre: "Estudiante no encontrado",
            apellido: ""
        };
      });
      proyectoData.integrantes = await Promise.all(estudiantesPromises);
    } else {
        proyectoData.integrantes = []; // Ensure it's an empty array if no students or if empty
    }

    res.status(200).json(proyectoData);
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({ error: 'Error al obtener detalle del proyecto' });
  }
});

module.exports = router;

