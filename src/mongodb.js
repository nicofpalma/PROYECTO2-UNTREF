/**
 * Módulo para la configuración inicial de MongoDB.
 * @module mongodb
 */

/**
 * Carga las variables de entorno desde el archivo .env utilizando dotenv.
 */
const dotenv = require('dotenv');
dotenv.config();

/**
 * Clase MongoClient de MongoDB para interactuar con la base de datos.
 * @const {object}
 */
const { MongoClient } = require('mongodb');

/**
 * La URL de conexión a la base de datos MongoDB obtenida desde las variables de entorno.
 * @constant {string}
 */
const URI = process.env.MONGODB_URLSTRING; 

/**
 * El cliente de MongoDB para realizar operaciones en la base de datos.
 * @type {object}
 */
const client = new MongoClient(URI);

/**
 * Conecta con MongoDB utilizando el cliente proporcionado.
 * @async
 * @returns {object|null} El cliente de MongoDB conectado o null en caso de error.
 */
const connectDB = async () => {
    try {
        await client.connect(); // Conecta al cliente de MongoDB al servidor
        console.log('Conectado a MongoDB');
        return client; // Retorna el cliente conectado
    } catch (error) {
        console.error(`Error al conectar con MongoDB, ${error}`);
        return null; // Retorna null en caso de error
    }
} 

/**
 * Desconecta el cliente de MongoDB.
 * @async
 */
const disconnectDB = async () => {
    try {
        await client.close();
        console.log('Desconectado de MongoDB');
    } catch (error) {
        console.error(`Error al desconectar con MongoDB, ${error}`);
    }
}

module.exports = {
    connectDB, 
    disconnectDB
};

