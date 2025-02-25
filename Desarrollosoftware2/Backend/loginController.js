// loginController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class LoginController {
    async login(req, res) {
        try {
            const { email, password, remember } = req.body;

            // Buscar usuario por email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email o contraseña incorrectos'
                });
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Email o contraseña incorrectos'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: remember ? '7d' : '24h' }
            );

            // Actualizar último inicio de sesión
            user.lastLogin = new Date();
            await user.save();

            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    async logout(req, res) {
        try {
            // Si estás usando tokens JWT, el logout se maneja principalmente del lado del cliente
            // borrando el token. Aquí puedes implementar lógica adicional si es necesario
            res.status(200).json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión'
            });
        }
    }

    // Middleware para verificar autenticación
    async authenticateToken(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token no proporcionado'
                });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: 'Token inválido o expirado'
                    });
                }

                req.user = user;
                next();
            });
        } catch (error) {
            console.error('Error en autenticación:', error);
            res.status(500).json({
                success: false,
                message: 'Error en la autenticación'
            });
        }
    }
}

module.exports = new LoginController();