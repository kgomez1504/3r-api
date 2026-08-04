const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const compression = require("compression");

const app = express();
app.use(cors());

// ============================================
//   COMPRESIÓN GZIP (REDUCE 70-80% TAMAÑO)
// ============================================
app.use(compression({
  level: 6, // Nivel de compresión (1-9, 6 es óptimo)
  threshold: 1024 // Comprimir si > 1KB
}));

// =====================================
//   CONFIGURACIÓN DE SQL SERVER
// =====================================
const config = {
  user: "sa3R",
  password: "Mauricio2004",
  server: "caleb.pe",
  port: 1433,
  database: "GesNube",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectionTimeout: 15000,
    requestTimeout: 15000
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
};

// ============================================
//   POOL GLOBAL (Conexiones reutilizables)
// ============================================
let pool;
async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

// =====================================
//   ENDPOINT DE PRUEBA DE CONEXIÓN
// =====================================
app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT 1 AS ok");
    res.json({ conectado: true, result: result.recordset });
  } catch (err) {
    res.status(500).json({ conectado: false, error: err.message });
  }
});

// =====================================
//   RUTA 1: STOCK (OPTIMIZADA)
// =====================================
app.get("/api/stock", async (req, res) => {
  try {
    const pool = await getPool();
    const limit = req.query.limit || 5000; // Limite por defecto

    const result = await pool.request().query(`
      SELECT TOP ${limit}
        Codigo,
        Stock,
        CostoPromedioSoles,
        CostoPromedioDolares,
        EnTransito,
        Almacen
      FROM dbo.AlmCuboStock
      WHERE EmpresaId = 22
        AND Almacen = 'Principal'
    `);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR API STOCK:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   RUTA 2: ARTÍCULOS (OPTIMIZADA)
// =====================================
app.get("/api/articulos", async (req, res) => {
  try {
    const pool = await getPool();
    const limit = req.query.limit || 5000; // Limite por defecto
    const filtro = req.query.filtro || null; // Filtro opcional

    let query = `
      SELECT TOP ${limit} *
      FROM dbo.AlmCuboArticulos3R
      WHERE EmpresaId = 22
    `;

    // Si hay filtro por columna_f (KROHNE, etc)
    if (filtro) {
      query += ` AND columna_f = '${filtro.toUpperCase()}'`;
    }

    const result = await pool.request().query(query);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR API ARTICULOS:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   RUTA 3: COTIZACIONES (OPTIMIZADA)
// =====================================
app.get("/api/cotizaciones", async (req, res) => {
  try {
    const pool = await getPool();
    const limit = req.query.limit || 5000;

    const result = await pool.request().query(`
      SELECT TOP ${limit}
        t.*,
        CONVERT(VARCHAR(10), t.FechaCotizacion, 23) AS FechaCotizacionFormateada
      FROM dbo.VenCuboArticuloxCotizacion3R t
      WHERE t.EmpresaId = 22
      ORDER BY t.FechaCotizacion ASC
    `);

    const data = result.recordset.map(row => {
      row.FechaCotizacion = row.FechaCotizacionFormateada;
      delete row.FechaCotizacionFormateada;
      return row;
    });

    res.json(data);

  } catch (err) {
    console.error("ERROR API COTIZACIONES:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   RUTA 4: CLIENTES (OPTIMIZADA)
// =====================================
app.get("/api/clientes", async (req, res) => {
  try {
    const pool = await getPool();
    const limit = req.query.limit || 5000;

    const result = await pool.request().query(`
      SELECT TOP ${limit}
        Codigo,
        Cliente,
        Activo,
        Vendedor,
        TipoCliente,
        FormaCobro,
        Direccion,
        Sede,
        Distrito,
        Provincia,
        Departamento,
        FechaModificacion
      FROM dbo.VenCuboClientes
      WHERE EmpresaId = 22
    `);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR API CLIENTES:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   RUTA: NOTAS DE PEDIDO (OPTIMIZADA)
// =====================================
app.get("/api/notas-pedido", async (req, res) => {
  try {
    const pool = await getPool();
    const limit = req.query.limit || 5000;

    const result = await pool.request().query(`
      SELECT TOP ${limit}
        t.*,
        CONVERT(VARCHAR(10), t.FechaPedido, 23) AS FechaPedidoFormateada
      FROM dbo.VenCuboArticuloxNotaPedido3R t
      WHERE t.EmpresaId = 22
      ORDER BY t.FechaPedido ASC
    `);

    const data = result.recordset.map(row => {
      row.FechaPedido = row.FechaPedidoFormateada;
      delete row.FechaPedidoFormateada;
      return row;
    });

    res.json(data);

  } catch (err) {
    console.error("ERROR API NOTAS PEDIDO:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   RUTA: ORDENES DE COMPRA (OPTIMIZADA)
// =====================================
app.get("/api/orden_compra", async (req, res) => {
  try {
    const pool = await getPool();
    const limit = req.query.limit || 5000;

    const result = await pool.request().query(`
      SELECT TOP ${limit}
        t.*,
        CONVERT(VARCHAR(10), t.Fecha, 23) AS FechaFormateada
      FROM dbo.ComCuboArticuloxOrdenCompra3R t
      WHERE t.EmpresaId = 22
      ORDER BY t.Fecha ASC
    `);

    const data = result.recordset.map(row => {
      row.Fecha = row.FechaFormateada;
      delete row.FechaFormateada;
      return row;
    });

    res.json(data);

  } catch (err) {
    console.error("ERROR API ORDENES COMPRA:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
//   RUTA NUEVA: ARTICULOS KROHNE SOLO
//   (Especialmente optimizada para Google Sheets)
// ============================================
app.get("/api/articulos/krohne", async (req, res) => {
  try {
    const pool = await getPool();
    const limit = req.query.limit || 5000;

    const result = await pool.request().query(`
      SELECT TOP ${limit} *
      FROM dbo.AlmCuboArticulos3R
      WHERE EmpresaId = 22
        AND columna_f = 'KROHNE'
    `);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR API ARTICULOS KROHNE:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   INICIAR SERVIDOR
// =====================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API escuchando en puerto ${PORT}`);
  console.log(`📊 Compresión GZIP activada`);
  console.log(`🔗 Pool de conexiones configurado`);
});

// Manejo de errores global
process.on('error', (err) => {
  console.error("ERROR GLOBAL:", err);
});
