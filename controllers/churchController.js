const connection = require('../config/db');

exports.getChurchById = (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ message: 'Se requiere el ID de la iglesia' });
    }
    
    const sql = 'SELECT * FROM churches WHERE id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener la iglesia:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Iglesia no encontrada' });
        }
        
        res.json(results[0]);
    });
};

exports.getAllChurches = (req, res) => {
    const sql = 'SELECT * FROM churches ORDER BY name';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener las iglesias:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        res.json(results);
    });
}; 