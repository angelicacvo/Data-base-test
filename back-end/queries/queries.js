// Queries are exported so they can be reused in different controllers or services.

// Search book by user
const bookByUser = `
  SELECT u.user_id, u.full_name, COUNT(l.loan_id) AS total_loans
  FROM users u
  LEFT JOIN loans l ON u.user_id = l.user_id
  GROUP BY u.user_id, u.full_name
  ORDER BY total_loans DESC;
`;

// Insert a new user into the database
const addNewUser = `
  INSERT INTO users(full_name, id_document, address, city, phone_number, email) 
  VALUES (?, ?, ?, ?, ?, ?)
`;

// Get all users
const getAllUsers = "SELECT * FROM users";

// Delete a user by ID
const deleteUser = "DELETE FROM users WHERE user_id = ?";

// Update user information by ID
const updateUser = `
  UPDATE users 
  SET full_name = ?, id_document = ?, address = ?, city = ?, phone_number = ?, email = ?
  WHERE user_id = ?
`;

// Get a single user by ID
const getUserById = "SELECT * FROM users WHERE user_id = ?";

// Insert user data from a CSV file (ignores duplicates)
const insertCSVData = `
  INSERT IGNORE INTO users(full_name, id_document, address, city, phone_number, email) 
  VALUES (?, ?, ?, ?, ?, ?)
`;

export {
  bookByUser,
  addNewUser,
  getAllUsers,
  deleteUser,
  updateUser,
  getUserById,
  insertCSVData
};









