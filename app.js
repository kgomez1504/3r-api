const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());

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
    trustServerCertificate: true
  }
};

// =====================================
//   ENDPOINT DE PRUEBA DE CONEXIÓN
// =====================================
app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT 1 AS ok");
    res.json({ conectado: true, result: result.recordset });
  } catch (err) {
    res.status(500).json({ conectado: false, error: err.message });
  }
});

// =====================================
//   RUTA 1: STOCK (TODAS LAS COLUMNAS)
// =====================================
app.get("/api/stock", async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT *
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
//   RUTA 2: ARTÍCULOS (TODAS LAS COLUMNAS)
// =====================================
app.get("/api/articulos", async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT *
      FROM dbo.AlmCuboArticulos3R
      WHERE EmpresaId = 22
    `);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR API ARTICULOS:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   RUTA 3: COTIZACIONES (TODAS LAS COLUMNAS)
// =====================================
app.get("/api/cotizaciones", async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT *
      FROM dbo.VenCuboArticuloxCotizacion
      WHERE EmpresaId = 22
    `);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR API COTIZACIONES:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================
//   RUTA 4: CLIENTES (equivalente a tu Power Query)
// =====================================
app.get("/api/clientes", async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT
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
//   INICIAR SERVIDOR
// =====================================
const PORT = 4000;
app.listen(PORT, () => {
  console.log("API escuchando en puerto " + PORT);
});
