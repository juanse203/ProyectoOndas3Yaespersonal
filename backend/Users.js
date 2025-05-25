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

// UPDAAAAAATE
router.post('/update/:uid', async (req, res) => {
  const { uid } = req.params;
  const { nombre, apellido, email, password } = req.body;

  try {
    const usuariosRef = db.collection('usuarios');
    const q = usuariosRef.where("uid", "==", uid);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      nombre,
      apellido,
      email,
      password
    });

    return res.status(200).json({ message: "Usuario actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error al actualizar usuario.", error: error.message });
  }
});

module.exports = router;


// Deletrear
router.delete('/delete/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const usuariosRef = db.collection('usuarios');
    const q = usuariosRef.where("uid", "==", uid);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.delete();

    return res.status(200).json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Error al eliminar usuario.", error: error.message });
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
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const offset = (page - 1) * limit; 

    const usuariosRef = db.collection('usuarios');

    // Paso 1: Obtener el conteo total de documentos para calcular totalPages
    const totalSnapshot = await usuariosRef.get();
    const totalItems = totalSnapshot.size; // Esto te da el número total de documentos

    // Paso 2: Construir la consulta con paginación
    let query = usuariosRef.orderBy('nombre'); 

    query = query.offset(offset).limit(limit);

    const snapshot = await query.get(); // Ejecuta la consulta paginada

    const usuariosList = [];
    snapshot.forEach(doc => {
      usuariosList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Paso 3: Calcular el total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    // Paso 4: Enviar la respuesta en el formato esperado por el frontend
    res.status(200).json({
      items: usuariosList,
      meta: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limit
      }
    });

  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error interno al obtener usuarios" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos." });
  }

  try {
    const usuariosRef = db.collection("usuarios");
    const querySnapshot = await usuariosRef.where("email", "==", email).get();

    if (querySnapshot.empty) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    let authenticatedUser = null;
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.password === password) {
        authenticatedUser = { id: doc.id, ...userData };
      }
    });

    if (authenticatedUser) {
      const { password, ...userWithoutPassword } = authenticatedUser;
      return res.status(200).json({
        message: "Inicio de sesión exitoso.",
        user: userWithoutPassword
      });
    } else {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

  } catch (error) {
    console.error("Error al intentar iniciar sesión:", error);
    return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
  }
});

module.exports = router;
