const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para login
router.post('/login', authController.login);

// Ruta para crear usuario (solo para desarrollo)
router.post('/create-user', authController.createUser);

// Ruta para verificar contraseña (solo para desarrollo)
router.post('/verify-password', authController.verifyUserPassword);

// Ruta para actualizar contraseña (solo para desarrollo)
router.post('/update-password', authController.updateUserPassword);

// Ruta para obtener todos los usuarios (solo para desarrollo)
router.get('/users', authController.getAllUsers);

// Ruta para perfil de usuario (protegida)
router.get('/profile', authController.verifyToken, (req, res) => {
    res.json({
        id: req.userId,
        username: req.username,
        role: req.userRole
    });
});

// Ruta para admin (protegida + verificación de rol)
router.get('/admin', 
    authController.verifyToken,
    authController.checkRole(['admin']),
    (req, res) => {
        res.json({ message: 'Ruta de administrador, acceso permitido' });
    }
);

module.exports = router; 