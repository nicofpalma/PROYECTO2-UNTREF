/**
 * Módulo principal de la aplicación.
 * @module server
 */

/**
 * Import de Express.
 * @const {object}
 */
const express = require('express');

/**
 * Funciones para conectarse y desconectarse de MongoDB
 * 
 */
const {connectDB, disconnectDB} = require("./src/mongodb");

/**
 * La aplicación Express.
 * @type {object}
 */
const app = express();

/**
 * El puerto en el que se ejecuta la aplicación importado desde el archivo .env.
 * @constant {number}
 */
const PORT = process.env.PORT;

/**
 * Función para controlar campos inválidos en solicitudes POST y PUT.
 * 
 */
const controlDeCampos = require('./utils.js');


/**
 * Middleware para analizar las solicitudes JSON.
 */
app.use(express.json());

/**
 * Middleware para establecer el encabezado Content-Type en las respuestas.
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

/**
 * Ruta principal para la página de inicio.
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    msg: "Página principal"
  })
});

/** 4) a)
 * Ruta para obtener todos los productos de la colección "computacion".
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con la lista de productos o un mensaje de error.
 */
app.get("/computacion", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB',
      });
      return;
    }

    // Obtener la colección de computacion y convertir los documentos a un array
    const db = client.db("computacion");
    // Obtiene toda la coleccion y la ordena de manera descendente por codigo
    const computacion = await db.collection("computacion").find().sort({ codigo: -1 }).toArray();
    res.status(200).json({
      response: computacion,
      success: true,
      msg: 'Productos obtenidos'
    });
  } catch (error) {
    // Manejo de errores al obtener los productos
    res.status(500).json({
      success: false,
      msg: 'Error al obtener los productos de la base de datos'
    });
  } finally {
    // Desconexión de la base de datos
    await disconnectDB();
  }
});

/** 4) b)
 * Ruta para obtener un producto por su código (ID).
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con el producto encontrado o un mensaje de error.
 */
app.get("/computacion/codigo/:codigo", async (req, res) => {
  const codigoProducto = parseInt(req.params.codigo.trim());

  if (isNaN(codigoProducto)) {
    res.status(400).json({
      success: false,
      msg: 'El código del producto no es válido, debe ser numérico'
    });
    return;
  };

  try {
    // Conexión a la base de datos
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    }

    // Obtener la colección de computacion y buscar el producto por su codigo
    const db = client.db("computacion");
    const producto = await db.collection("computacion").findOne({ codigo: codigoProducto });
    if (producto) {
      res.status(200).json({
        response: producto,
        success: true,
        msg: `Producto ${codigoProducto} encontrado con éxito`
      });
    } else {
      res.status(404).json({
        success: false,
        msg: `El producto con código ${codigoProducto} no existe`
      });
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).json({
      success: false,
      msg: 'Error al obtener el producto de la base de datos'
    });
  } finally {
    // Desconexión de la base de datos
    await disconnectDB();
  }
});

// 4) c) Ruta para obtener un producto por su nombre
app.get("/computacion/nombre/:nombre", async (req, res) => {
  const productoQuery = req.params.nombre.trim();
  let productoNombre = RegExp(productoQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    }

    // Obtener la colección de computacion y buscar el producto por su Nombre
    const db = client.db("computacion");
    const producto = await db.collection("computacion").find({ nombre: productoNombre }).toArray();
    // const fruta = await db.collection("frutas").find({ nombre: {$regex: frutaNombre}}).toArray();
    if (producto.length > 0) {
      res.status(200).json({
        response: producto,
        success: true,
        msg: 'Producto/s encontrado/s con éxito'
      });
    } else {
      res.status(404).json({
        success: false,
        msg: 'No se encontraron productos'
      });
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).json({
      success: false,
      msg: 'Error al obtener el/los producto/s de la base de datos'
    });
  } finally {
    // Desconexión de la base de datos
    await disconnectDB();
  }
});

/**
 * Ruta para obtener productos por su precio, los mayores o iguales al precio pasado por parámetro.
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con los productos encontrados o un mensaje de error.
 */
app.get("/computacion/precio/:precio", async (req, res) => {
  const productoPrecio = parseFloat(req.params.precio.trim());

  if (!productoPrecio) {
    res.status(400).json({
      success: false,
      msg: 'El precio debe ser numérico'
    });
    return;
  };

  try {
    // Conexión a la base de datos
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    }

    // Obtener la colección de productos y buscar el producto por su precio,
    const db = client.db("computacion");
    const producto = await db
      .collection("computacion")
      .find({ precio: { $gte: productoPrecio } })
      .toArray();

    if (producto.length > 0) {
      res.status(200).json({
        response: producto,
        success: true,
        msg: 'Producto encontrado con éxito'
      });
    } else {
      res.status(404).json({
        success: false,
        msg: 'Producto no encontrado'
      });
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).json({
      success: false,
      msg: 'Error al obtener el producto de la base de datos'
    });
  } finally {
    // Desconexión de la base de datos
    await disconnectDB();
  }
});

/** 4) d)
 * Ruta para obtener productos por categoría. Solo devuelve coincidencias exactas con el nombre de categoría que se le envía.
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con los productos encontrados o un mensaje de error.
 */
app.get("/computacion/categoria/:categoria", async (req, res) => {
  const queryProducto = req.params.categoria.trim();
  const categoriaProducto = new RegExp(`^${queryProducto}$`, "i");

  try {
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    }

    const db = client.db("computacion");
    const productos = await db.collection("computacion").find({ categoria: categoriaProducto }).toArray();

    if (productos.length > 0) {
      res.status(200).json({
        respnse: productos,
        success: true,
        msg: 'Categoría encontrada con éxito'
      });
    } else {
      res.status(404).json({
        success: false,
        msg: 'Categoría no encontrada'
      });
    };
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al obtener la categoría de la base de datos'
    });
  } finally {
    await disconnectDB();
  }
});

/** 4) e)
 * Ruta para agregar un nuevo producto.
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con el nuevo producto creado o un mensaje de error.
 */
app.post("/computacion", async (req, res) => {
  const nuevoProducto = req.body;
  const codigoProducto = parseInt(req.body.codigo);

  // Verificación de campos no permitidos
  const camposNoPermitidos = controlDeCampos(nuevoProducto);

  if (camposNoPermitidos.length > 0) {
    res.status(400).json({
      success: false,
      msg: `Error, se enviaron campos que no están en la base de datos: ${camposNoPermitidos.join(", ")}`
    });
    return;
  };

  try {
    if (nuevoProducto === undefined) {
      res.status(400).json({
        success: false,
        msg: 'Error en el formato de datos a crear'
      });
      return;
    }

    // Codigo inválido
    if (!codigoProducto || codigoProducto < 1) {
      res.status(400).json({
        success: false,
        msg: 'Código de producto inválido'
      });
      return;
    };

    if (!nuevoProducto.nombre || nuevoProducto.nombre === '') {
      res.status(400).json({
        success: false,
        msg: 'Le falta enviar el nombre del producto'
      });
      return;
    };

    if (!nuevoProducto.precio || nuevoProducto.precio === '') {
      res.status(400).json({
        success: false,
        msg: 'Le falta enviar el precio del producto'
      });
      return;
    };

    if (!nuevoProducto.categoria || nuevoProducto.categoria === '') {
      res.status(400).json({
        success: false,
        msg: 'Le falta enviar la categoria del producto'
      });
      return;
    };

    // Conexión a la base de datos
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    }
    const db = client.db("computacion");
    const collection = db.collection("computacion");

    // Corrorobar que el codigo no exista
    const codigoExiste = await collection.findOne({ codigo: codigoProducto });
    if (codigoExiste) {
      res.status(400).json({
        success: false,
        msg: `El código de producto ${codigoProducto}, ya existe. No puede haber otro nuevo producto con el mismo código`
      });
      return;
    };

    // Insertar nuevo producto
    const response = await collection.insertOne(nuevoProducto);
    if (response.acknowledged) {
      res.status(201).json({
        response: nuevoProducto,
        success: true,
        msg: 'Nuevo producto creado con éxito'
      });
    } else {
      res.status(500).json({
        success: false,
        msg: 'No se pudo crear el nuevo producto'
      });
    };
  } catch (error) {
    // Manejo de errores al agregar el producto
    res.status(500).json({
      success: false,
      msg: 'Error al intentar agregar un nuevo producto'
    });
  } finally {
    // Desconexión de la base de datos
    await disconnectDB();
  }
});

/**
 * Ruta para modificar un producto existente (con todos sus campos).
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con los datos modificados del producto o un mensaje de error.
 */
app.put("/computacion/:codigo", async (req, res) => {
  const codigoProducto = parseInt(req.params.codigo.trim());
  const nuevosDatos = req.body;
  try {
    if (!nuevosDatos) {
      res.status(400).json({
        success: false,
        msg: 'Error en el formato de datos enviados'
      });
      return;
    };

    if (!codigoProducto) {
      res.status(400).json({
        success: false,
        msg: 'El código de producto es inválido'
      })
      return;
    }

    // Verificación de campos no permitidos
    const camposNoPermitidos = controlDeCampos(nuevosDatos);

    if (camposNoPermitidos.length > 0) {
      res.status(400).json({
        success: false,
        msg: `Error, se enviaron campos que no están en la base de datos: ${camposNoPermitidos.join(", ")}`
      });
      return;
    };


    if (!nuevosDatos.codigo || nuevosDatos.codigo === '') {
      res.status(400).json({
        success: false,
        msg: 'Le falta enviar el código del producto para modificar'
      })
      return;
    }

    if (!nuevosDatos.nombre || nuevosDatos.nombre === '') {
      res.status(400).json({
        success: false,
        msg: 'Le falta enviar el nombre del producto para modificar'
      })
      return;
    }

    if (!nuevosDatos.precio || nuevosDatos.precio === '') {
      res.status(400).json({
        success: false,
        msg: 'Le falta enviar el precio del producto a modificar'
      })
      return;
    }

    if (!nuevosDatos.categoria || nuevosDatos.categoria === '') {
      res.status(400).json({
        success: false,
        msg: 'Le falta enviar la categoría del producto a modificar'
      })
      return;
    }

    // Conexión a la base de datos
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    }

    const db = client.db("computacion");
    const collection = db.collection("computacion");

    // Envío de datos y control de respuesta
    const response = await collection.updateOne({ codigo: codigoProducto }, { $set: nuevosDatos });
    if (response.acknowledged && response.matchedCount === 1 & response.modifiedCount === 1){
      res.status(200).json({
        response: nuevosDatos,
        success: true,
        msg: 'Datos modificados con éxito'
      });
    } else {
      res.status(500).json({
        response: false,
        msg: 'No se pudo modificar el producto, intente nuevamente'
      });
    };
  } catch (error) {
    // Manejo de errores al modificar el producto
    res.status(500).json({
      success: false,
      msg: 'Error al modificar el producto'
    });
  } finally {
    // Desconexión de la base de datos
    await disconnectDB();
  }
});

/**
 * Ruta para cambiar el precio de un producto (solo el precio).
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con un mensaje de éxito o un mensaje de error.
 */
app.patch("/computacion/:codigo", async (req, res) => {
  const codigoProducto = parseInt(req.params.codigo.trim());
  const nuevoPrecio = parseFloat(req.body.precio);

  try {
    if (!codigoProducto || codigoProducto <= 0) {
      res.status(400).json({
        success: false,
        msg: 'El código de producto es inválido'
      })
      return;
    }

    // Precio inválido
    if (!nuevoPrecio || nuevoPrecio <= 0) {
      res.status(400).json({
        success: false,
        msg: 'Ingrese un precio válido para el producto'
      });
      return;
    };

    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    };
    const db = client.db("computacion");
    const collection = db.collection("computacion");

    // Cambiar solo el precio
    const response = await collection.updateOne({ codigo: codigoProducto }, { $set: { precio: nuevoPrecio } });
    if (response.matchedCount === 1 && response.modifiedCount === 1) {
      res.status(200).json({
        success: true,
        msg: 'Precio modificado con éxito'
      });
    } else {
      res.status(404).json({
        success: false,
        msg: `El producto solicitado con código ${codigoProducto}, no existe`
      })
    };
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al modificar el precio del producto'
    });
  } finally {
    await disconnectDB();
  };

})

/** 4) g)
 * Ruta para eliminar un producto.
 * @param {object} req - El objeto de solicitud.
 * @param {object} res - El objeto de respuesta.
 * @returns {object} El objeto de respuesta con un mensaje de éxito o un mensaje de error.
 */
app.delete("/computacion/:codigo", async (req, res) => {
  const codigoProducto = parseInt(req.params.codigo.trim());
  try {
    if (!codigoProducto) {
      res.status(400).json({
        success: false,
        msg: 'Error en el formato de datos'
      });
      return;
    }

    // Conexión a la base de datos
    const client = await connectDB();
    if (!client) {
      res.status(500).json({
        success: false,
        msg: 'Error al conectarse a MongoDB'
      });
      return;
    }

    // Obtener la colección de productos, buscar el producto por su codigo y eliminarlo
    const db = client.db("computacion");
    const collection = db.collection("computacion");
    const response = await collection.deleteOne({ codigo: codigoProducto });
    if (!response.acknowledged && response.deletedCount === 0) {
      res.status(404).json({
        success: false,
        msg: 'No se encontró ningun producto con el código seleccionado'
      });
    } else {
      res.status(200).json({
        success: true,
        msg: 'Producto eliminado con éxito'
      });
    }
  } catch (error) {
    // Manejo de errores al obtener los productos
    res.status(500).json({
      success: false,
      msg: 'Error al eliminar el producto'
    });
  } finally {
    // Desconexión de la base de datos
    await disconnectDB();
  }
});

/**
 * Inicia el servidor y escucha en el puerto especificado.
 */
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

/**
 * Control de rutas inválidas o inexistentes.
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: 'Ruta inválida o inexistente, compruebe nuevamente'
  })
})