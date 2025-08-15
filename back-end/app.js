const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const {
  uploadUsersFromCSV
} = require("./uploadcsv");

const app = express();
app.use(express.json());

app.use(cors());

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT,
});

//Users csv upload
app.post("/upload-users-csv", async (req, res) => {
  uploadUsersFromCSV();
  res.json({ message: "Proceso de carga iniciado" });
});

app.post("/upload-users", async (req, res) => {
  const {
    user_full_name,
    user_id_document,
    user_address,
    user_city,
    user_phone_number,
    user_email,
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO users(full_name, id_document, address, city, phone_number, email) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_full_name,
        user_id_document,
        user_address,
        user_city,
        user_phone_number,
        user_email,
      ]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({
        user_full_name,
        user_id_document,
        user_address,
        user_city,
        user_phone_number,
        user_email,
      });
    } else {
      res.status(200).json({ message: "Usuario ya existente o no insertado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al insertar el usuario" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    return res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

app.put("/update-user/:id", async (req, res) => {
  const { id } = req.params;
  const {
    user_full_name,
    user_id_document,
    user_address,
    user_city,
    user_phone_number,
    user_email,
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE users 
       SET full_name = ?, id_document = ?, address = ?, city = ?, phone_number = ?, email = ?
       WHERE user_id = ?`,
      [
        user_full_name,
        user_id_document,
        user_address,
        user_city,
        user_phone_number,
        user_email,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

//ADVANCED QUERIES
// Books rented by each user
app.get("/reports/books-by-user", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.user_id, u.full_name, COUNT(l.loan_id) AS total_loans
      FROM users u
      LEFT JOIN loans l ON u.user_id = l.user_id
      GROUP BY u.user_id, u.full_name
      ORDER BY total_loans DESC;
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener libros por usuario" });
  }
});


// Postman
// http://localhost:3000/reports/books-by-user


app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000")
);