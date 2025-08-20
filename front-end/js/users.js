const APP_URL = "http://localhost:3000/";
const tbody_users = document.getElementById("tbody_users");
const addButton = document.getElementById("addButton");

// Upload users from CSV file by calling backend API
document.getElementById("upload_users").addEventListener("click", async () => {
  try {
    const res = await fetch(APP_URL + "upload-users-csv", {
      method: "POST",
    });
    const data = await res.json();
    alert(`${data.message}`);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// Immediately fetch and display all users when page loads
(async function index() {
  try {
    const res = await fetch(APP_URL + "users");
    if (!res.ok) throw new Error("Error al cargar usuarios");

    const data = await res.json();
    console.log("GET:", data);
    tbody_users.innerHTML = "";

    if (data.length === 0) {
      tbody_users.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No hay usuarios registrados</td>
                </tr>
            `;
      return;
    }

    data.forEach((user) => {
      // Dynamically add user rows to the table
      tbody_users.innerHTML += `
                <tr>
                    <td>${user.user_id || ''}</td>
                    <td>${user.full_name || ''}</td>
                    <td>${user.id_document || ''}</td>
                    <td>${user.address || ''}</td>
                    <td>${user.city || ''}</td>
                    <td>${user.phone_number || ''}</td>
                    <td>${user.email || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="updateData(${user.user_id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteData(${user.user_id})">Eliminar</button>
                    </td>
                </tr>
            `;
    });
  } catch (error) {
    console.error("Error loading users:", error);
    alert("Error al cargar los usuarios");
  }
})();

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
  // Remove spaces and check if it's alphanumeric
  const cleanId = idDocument.replace(/\s/g, '');
  return cleanId.length >= 5 && /^[a-zA-Z0-9]+$/.test(cleanId);
}

function validateName(name) {
  return name.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
}

// Add a new user (called when form is submitted)
async function store() {
  try {
    // Collect and validate form fields
    const user_full_name = document.getElementById("user_full_name").value.trim();
    const user_id_document = document.getElementById("user_id_document").value.trim();
    const user_address = document.getElementById("user_address").value.trim();
    const user_city = document.getElementById("user_city").value.trim();
    const user_phone_number = document.getElementById("user_phone_number").value.trim();
    const user_email = document.getElementById("user_email").value.trim();

    // Required fields validation
    if (!user_full_name || !user_id_document || !user_address || !user_city || !user_phone_number || !user_email) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Specific validations
    if (!validateName(user_full_name)) {
      alert("El nombre completo debe tener al menos 2 caracteres y solo contener letras y espacios");
      return;
    }

    if (!validateIdDocument(user_id_document)) {
      alert("El documento de identidad debe tener al menos 5 caracteres alfanuméricos");
      return;
    }

    if (user_address.length < 5) {
      alert("La dirección debe tener al menos 5 caracteres");
      return;
    }

    if (!validateName(user_city)) {
      alert("La ciudad debe tener al menos 2 caracteres y solo contener letras y espacios");
      return;
    }

    if (!validatePhone(user_phone_number)) {
      alert("El teléfono debe tener al menos 7 dígitos y formato válido");
      return;
    }

    if (!validateEmail(user_email)) {
      alert("El correo electrónico no tiene un formato válido");
      return;
    }

    // Call backend API to save user
    const res = await fetch(APP_URL + "upload-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_full_name,
        user_id_document,
        user_address,
        user_city,
        user_phone_number,
        user_email,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Usuario agregado correctamente");
      location.reload();
      const modal = bootstrap.Modal.getInstance(document.getElementById("courseModal"));
      if (modal) modal.hide();
    } else {
      alert(data.message || "Error al agregar usuario");
    }
  } catch (error) {
    console.error("Error en POST:", error);
    alert("Error de conexión al agregar usuario");
  }
}

// Bind store function to Add button
addButton?.addEventListener("click", store);

// Delete user by ID (confirmation before request)
function deleteData(id) {
  if (!id) {
    alert("ID de usuario inválido");
    return;
  }

  if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
    fetch(APP_URL + "users/" + id, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error al eliminar usuario");
        return response.json();
      })
      .then((data) => {
        alert(data.message);
        location.reload();
      })
      .catch((error) => {
        console.error(error);
        alert("Hubo un problema al eliminar el usuario");
      });
  }
}

// Load user data into modal and allow editing
function updateData(id) {
  if (!id) {
    alert("ID de usuario inválido");
    return;
  }

  fetch(APP_URL + "users/" + id)
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo obtener el usuario");
      return res.json();
    })
    .then((user) => {
      // Fill modal form with existing user data
      document.getElementById("user_full_name").value = user.full_name || '';
      document.getElementById("user_id_document").value = user.id_document || '';
      document.getElementById("user_address").value = user.address || '';
      document.getElementById("user_city").value = user.city || '';
      document.getElementById("user_phone_number").value = user.phone_number || '';
      document.getElementById("user_email").value = user.email || '';
      document.getElementById("courseModalLabel").textContent = "Editar Usuario";

      const modalEl = document.getElementById("courseModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      // Update button changes from "Add" to "Update"
      const addButton = document.getElementById("addButton");
      addButton.textContent = "Actualizar";

      // Replace old listener with new update listener
      addButton.replaceWith(addButton.cloneNode(true));
      const newAddButton = document.getElementById("addButton");

      // Handle update request
      newAddButton.addEventListener("click", async () => {
        const user_full_name = document.getElementById("user_full_name").value.trim();
        const user_id_document = document.getElementById("user_id_document").value.trim();
        const user_address = document.getElementById("user_address").value.trim();
        const user_city = document.getElementById("user_city").value.trim();
        const user_phone_number = document.getElementById("user_phone_number").value.trim();
        const user_email = document.getElementById("user_email").value.trim();

        // Required fields validation
        if (!user_full_name || !user_id_document || !user_address || !user_city || !user_phone_number || !user_email) {
          alert("Todos los campos son obligatorios");
          return;
        }

        // Specific validations
        if (!validateName(user_full_name)) {
          alert("El nombre completo debe tener al menos 2 caracteres y solo contener letras y espacios");
          return;
        }

        if (!validateIdDocument(user_id_document)) {
          alert("El documento de identidad debe tener al menos 5 caracteres alfanuméricos");
          return;
        }

        if (user_address.length < 5) {
          alert("La dirección debe tener al menos 5 caracteres");
          return;
        }

        if (!validateName(user_city)) {
          alert("La ciudad debe tener al menos 2 caracteres y solo contener letras y espacios");
          return;
        }

        if (!validatePhone(user_phone_number)) {
          alert("El teléfono debe tener al menos 7 dígitos y formato válido");
          return;
        }

        if (!validateEmail(user_email)) {
          alert("El correo electrónico no tiene un formato válido");
          return;
        }

        try {
          const res = await fetch(APP_URL + "update-user/" + id, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_full_name,
              user_id_document,
              user_address,
              user_city,
              user_phone_number,
              user_email,
            }),
          });

          const data = await res.json();

          if (res.ok) {
            alert("Usuario actualizado correctamente");
            modal.hide();
            location.reload();
          } else {
            alert(data.message || "Error al actualizar usuario");
          }
        } catch (error) {
          console.error(error);
          alert("Error de conexión al actualizar usuario");
        }
      });
    })
    .catch((err) => {
      console.error(err);
      alert("No se pudo cargar el usuario para editar");
    });
}