/**
 * Función para controlar que no haya campos extras en las solicitudes POST y PUT.
 * @param {object} nuevoProducto - El objeto que contiene los campos del nuevo producto.
 * @returns {string[]} Un array con los nombres de los campos no permitidos encontrados en el objeto.
 */

function controlDeCampos(nuevoProducto) {
    const camposPermitidos = ["codigo", "nombre", "precio", "categoria"];

    /**
     * Filtra los campos no permitidos en el objeto proporcionado.
     * @param {string} campo - El nombre de un campo en el objeto.
     * @returns {boolean} `true` si el campo no está permitido, `false` en caso contrario.
     */
    const camposNoPermitidos = Object.keys(nuevoProducto).filter(
        campo => !camposPermitidos.includes(campo)
    );

    return camposNoPermitidos;
}

module.exports = controlDeCampos;