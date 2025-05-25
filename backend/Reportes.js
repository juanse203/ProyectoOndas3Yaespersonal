const express = require("express");
const router = express.Router();
const { getFirestore } = require("firebase-admin/firestore");
const PDFDocument = require("pdfkit");

const db = getFirestore();

// Ruta para listar proyectos con filtros
router.get('/listar', async (req, res) => {
  try {
    const { profesorId, institucion, estado } = req.query;
    let query = db.collection('proyectos');

    let snapshot = await query.get();
    let proyectos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Aplicar filtros manuales
    if (profesorId) proyectos = proyectos.filter(p => p.profesorId === profesorId);
    if (institucion) proyectos = proyectos.filter(p => p.institucion === institucion);
    if (estado) proyectos = proyectos.filter(p => p.estadoActual === estado);

    const proyectosEnriquecidos = await Promise.all(proyectos.map(async (p) => {
      // Profesor
      if (p.profesorId) {
        const profesorDoc = await db.collection('usuarios').doc(p.profesorId).get();
        if (profesorDoc.exists) {
          p.profesor = {
            nombre: profesorDoc.data().nombre,
            apellido: profesorDoc.data().apellido
          };
        }
      }

      // Integrantes
      if (Array.isArray(p.integrantes)) {
        const integrantesData = await Promise.all(
          p.integrantes.map(async (id) => {
            const doc = await db.collection('usuarios').doc(id).get();
            return doc.exists
              ? { nombre: doc.data().nombre, apellido: doc.data().apellido }
              : { nombre: "No encontrado", apellido: "" };
          })
        );
        p.integrantes = integrantesData;
      }

      return p;
    }));

    res.status(200).json(proyectosEnriquecidos);
  } catch (error) {
    console.error("Error al listar reportes:", error);
    res.status(500).json({ error: 'Error interno al obtener reportes' });
  }
});

// Ruta para generar PDF con filtros
router.get("/reporte-pdf", async (req, res) => {
  try {
    const { profesorId, institucion, estado } = req.query;
    let query = db.collection("proyectos");
    let snapshot = await query.get();
    let proyectos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Aplicar filtros
    if (profesorId) proyectos = proyectos.filter(p => p.profesorId === profesorId);
    if (institucion) proyectos = proyectos.filter(p => p.institucion === institucion);
    if (estado) proyectos = proyectos.filter(p => p.estadoActual === estado);

    const proyectosEnriquecidos = await Promise.all(proyectos.map(async (p) => {
      if (p.profesorId) {
        const profesorDoc = await db.collection('usuarios').doc(p.profesorId).get();
        if (profesorDoc.exists) {
          p.profesor = {
            nombre: profesorDoc.data().nombre,
            apellido: profesorDoc.data().apellido
          };
        }
      }

      if (Array.isArray(p.integrantes)) {
        const integrantesData = await Promise.all(
          p.integrantes.map(async (id) => {
            const doc = await db.collection('usuarios').doc(id).get();
            return doc.exists
              ? { nombre: doc.data().nombre, apellido: doc.data().apellido }
              : { nombre: "No encontrado", apellido: "" };
          })
        );
        p.integrantes = integrantesData;
      }

      return p;
    }));

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte-proyectos.pdf");

    doc.pipe(res);
    doc.fontSize(20).text("Reporte de Proyectos", { align: "center" });
    doc.moveDown();

    proyectosEnriquecidos.forEach((proy, index) => {
      doc.fontSize(14).text(`Título: ${proy.titulo}`);
      doc.fontSize(12)
        .text(`Área: ${proy.area}`)
        .text(`Institución: ${proy.institucion}`)
        .text(`Objetivos: ${proy.objetivos}`)
        .text(`Cronograma: ${proy.cronograma}`)
        .text(`Presupuesto: $${proy.presupuesto}`)
        .text(`Profesor: ${proy.profesor?.nombre || ""} ${proy.profesor?.apellido || ""}`)
        .text(`Observaciones: ${proy.observaciones || "Ninguna"}`)
        .text(`Estado Actual: ${proy.estadoActual || "Formulación"}`)
        .moveDown();

      if (proy.historialEstados?.length > 0) {
        doc.font("Helvetica-Bold").text("Historial de Estados:");
        proy.historialEstados.forEach(est => {
          doc.font("Helvetica").text(`- ${est.estado} (${new Date(est.fecha).toLocaleDateString()}): ${est.observacion}`);
        });
        doc.moveDown();
      }

      if (proy.integrantes?.length > 0) {
        doc.font("Helvetica-Bold").text("Estudiantes Asignados:");
        proy.integrantes.forEach(est => {
          doc.font("Helvetica").text(`- ${est.nombre} ${est.apellido}`);
        });
        doc.moveDown();
      }

      if (proy.avances?.length > 0) {
        doc.font("Helvetica-Bold").text("Avances:");
        proy.avances.forEach(avance => {
          doc.font("Helvetica")
            .text(`Fecha: ${new Date(avance.fecha).toLocaleDateString()}`)
            .text(`Descripción: ${avance.descripcion}`);
          if (avance.documentos?.length) doc.text(`Documentos: ${avance.documentos.join(", ")}`);
          if (avance.fotos?.length) doc.text(`Fotos: ${avance.fotos.join(", ")}`);
          doc.moveDown();
        });
      }

      if (index < proyectosEnriquecidos.length - 1) {
        doc.moveDown().text('--------------------------------------------------', { align: 'center' }).moveDown();
      }
    });

    doc.end();
  } catch (err) {
    console.error("Error al generar PDF:", err);
    res.status(500).json({ message: "Error al generar el reporte PDF" });
  }
});

module.exports = router;
