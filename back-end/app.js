import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import { uploadUsersFromCSV } from "./uploadcsv.js";
import { bookByUser, addNewUser, getAllUsers, deleteUser, updateUser, getUserById } from "./queries/queries.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone) && phone.length >= 7;
}

function validateIdDocument(idDocument) {
  const cleanId = idDocument.replace(/\s/g, '');
  return cleanId.length >= 5 && /^[a-zA-Z0-9]+$/.test(cleanId);
}

function validateName(name) {
  return name.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
}

function validateAddress(address) {
  return address.length >= 5;
}

// Upload users from CSV file
app.post("/upload-users-csv", async (req, res) => {
  try {
    uploadUsersFromCSV();
    res.status(202).json({ message: "Proceso de carga de CSV iniciado" });
  } catch (error) {
    console.error("CSV upload error:", error);
    res.status(500).json({ message: "Error al procesar la carga del CSV" });
  }
});

// Insert a new user manually
app.post("/upload-users", async (req, res) => {
  try {
    const {
      user_full_name,
      user_id_document,
      user_address,
      user_city,
      user_phone_number,
      user_email,
    } = req.body;

    // Required fields validation
    if (!user_full_name || !user_id_document || !user_address || !user_city || !user_phone_number || !user_email) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Trim all fields, initial and final spaces
    const trimmedData = {
      user_full_name: user_full_name.trim(),
      user_id_document: user_id_document.trim(),
      user_address: user_address.trim(),
      user_city: user_city.trim(),
      user_phone_number: user_phone_number.trim(),
      user_email: user_email.trim().toLowerCase()
    };

    // Specific validations
    if (!validateName(trimmedData.user_full_name)) {
      return res.status(400).json({ message: "El nombre completo debe tener al menos 2 caracteres y solo contener letras y espacios" });
    }

    if (!validateIdDocument(trimmedData.user_id_document)) {
      return res.status(400).json({ message: "El documento de identidad debe tener al menos 5 caracteres alfanuméricos" });
    }

    if (!validateAddress(trimmedData.user_address)) {
      return res.status(400).json({ message: "La dirección debe tener al menos 5 caracteres" });
    }

    if (!validateName(trimmedData.user_city)) {
      return res.status(400).json({ message: "La ciudad debe tener al menos 2 caracteres y solo contener letras y espacios" });
    }

    if (!validatePhone(trimmedData.user_phone_number)) {
      return res.status(400).json({ message: "El teléfono debe tener al menos 7 dígitos y formato válido" });
    }

    if (!validateEmail(trimmedData.user_email)) {
      return res.status(400).json({ message: "El correo electrónico no tiene un formato válido" });
    }

    const [result] = await pool.query(addNewUser, [
      trimmedData.user_full_name,
      trimmedData.user_id_document,
      trimmedData.user_address,
      trimmedData.user_city,
      trimmedData.user_phone_number,
      trimmedData.user_email,
    ]);

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: trimmedData
      });
    } else {
      res.status(409).json({ message: "No se pudo crear el usuario" });
    }
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ message: "Error interno del servidor al crear el usuario" });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query(getAllUsers);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
});

// Get user by ID 
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const [rows] = await pool.query(getUserById, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
});

// Delete user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const [result] = await pool.query(deleteUser, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error interno del servidor al eliminar el usuario" });
  }
});

// Update user by ID
app.put("/update-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_full_name,
      user_id_document,
      user_address,
      user_city,
      user_phone_number,
      user_email,
    } = req.body;

    // Validate ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    // Required fields validation
    if (!user_full_name || !user_id_document || !user_address || !user_city || !user_phone_number || !user_email) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Trim all fields
    const trimmedData = {
      user_full_name: user_full_name.trim(),
      user_id_document: user_id_document.trim(),
      user_address: user_address.trim(),
      user_city: user_city.trim(),
      user_phone_number: user_phone_number.trim(),
      user_email: user_email.trim().toLowerCase()
    };

    // Specific validations
    if (!validateName(trimmedData.user_full_name)) {
      return res.status(400).json({ message: "El nombre completo debe tener al menos 2 caracteres y solo contener letras y espacios" });
    }

    if (!validateIdDocument(trimmedData.user_id_document)) {
      return res.status(400).json({ message: "El documento de identidad debe tener al menos 5 caracteres alfanuméricos" });
    }

    if (!validateAddress(trimmedData.user_address)) {
      return res.status(400).json({ message: "La dirección debe tener al menos 5 caracteres" });
    }

    if (!validateName(trimmedData.user_city)) {
      return res.status(400).json({ message: "La ciudad debe tener al menos 2 caracteres y solo contener letras y espacios" });
    }

    if (!validatePhone(trimmedData.user_phone_number)) {
      return res.status(400).json({ message: "El teléfono debe tener al menos 7 dígitos y formato válido" });
    }

    if (!validateEmail(trimmedData.user_email)) {
      return res.status(400).json({ message: "El correo electrónico no tiene un formato válido" });
    }

    const [result] = await pool.query(updateUser, [
      trimmedData.user_full_name,
      trimmedData.user_id_document,
      trimmedData.user_address,
      trimmedData.user_city,
      trimmedData.user_phone_number,
      trimmedData.user_email,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error interno del servidor al actualizar el usuario" });
  }
});

// Report: books rented by each user
app.get("/reports/books-by-user", async (req, res) => {
  try {
    const [rows] = await pool.query(bookByUser);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching books by user report:", error);
    res.status(500).json({ message: "Error al obtener el reporte de libros por usuario" });
  }
});

// SERVER START
app.listen(3000, () => console.log("Server running on http://localhost:3000"));