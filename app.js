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
//   RUTA 1: STOCK
// =====================================
app.get("/api/stock", async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT 
        Codigo,
        Articulo,
        Almacen,
        Stock,
        CostoPromedioSoles,
        CostoPromedioDolares,
        EnTransito
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
//   RUTA 2: ARTÍCULOS
// =====================================
app.get("/api/articulos", async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT 
        Codigo,
        Articulo,
        CodigoParte,
        MarcaArticulo,
        Familia,
        Clase,
        SubClase,
        Laboratorio,
        PesoNeto,
        Origen,
        Fabricante
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
//   INICIAR SERVIDOR
// =====================================
const PORT = 4000; // <-- puerto para ngrok
app.listen(PORT, () => {
  console.log("API escuchando en puerto " + PORT);
});
