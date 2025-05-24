const express = require('express');
const router = express.Router();
const { db, auth } = require('./firebaseAdmin');

// Registro usuario
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;

  try {
    // Solo lo guardamos en Firestore, sin autenticación todavía
    const newUserRef = db.collection('usuarios').doc();
    await newUserRef.set({
      uid: newUserRef.id,
      nombre,
      apellido,
      email,
      password,
      rol,
      autenticado: false,
    });

    res.status(201).json({ message: "Usuario registrado, pendiente de autenticación" });
  } catch (err) {
    console.error("Error al registrar:", err);
    res.status(500).json({ error: "Error interno" });
  }
});


// Autenticación de cuenta
router.post('/authenticate', async (req, res) => {
  const { uid, password } = req.body;

  try {
    const userDoc = await db.collection('usuarios').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: "Usuario no encontrado" });

    const userData = userDoc.data();

    const userRecord = await auth.createUser({
      email: userData.email,
      password,
      displayName: `${userData.nombre} ${userData.apellido}`
    });

    // Actualizar estado de autenticación
    await db.collection('usuarios').doc(uid).update({
      autenticado: true,
      firebaseUid: userRecord.uid
    });

    res.status(200).json({ message: "Cuenta autenticada correctamente" });
  } catch (err) {
    console.error("Error en autenticación:", err);
    res.status(500).json({ error: "Error al autenticar" });
  }
});

// Obtener perfil
router.get('/perfil/:uid', async (req, res) => {
  try {
    const doc = await db.collection('usuarios').doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(doc.data());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

module.exports = router

// lista de usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.get(); // Obtiene todos los documentos de la colección 'usuarios'

    const usuariosList = [];
    snapshot.forEach(doc => {
      usuariosList.push({
        id: doc.id,
        ...doc.data() 
      });
    });

    res.status(200).json(usuariosList); // Envía la lista de usuarios como JSON
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error interno al obtener usuarios" });
  }
});

//Login
router.post('/Login', async (req, res) =>{
  const usuarios = collection
  const usuario = {email, password} = req.body
  try {
    const resultado = query()
    
  } catch (error) {
    
  }
})