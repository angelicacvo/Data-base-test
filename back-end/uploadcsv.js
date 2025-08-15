const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();
const mysql = require('mysql2/promise');

async function uploadUsersFromCSV() {
  let client;

  try {
    client = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.DB_USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      port: process.env.PORT
    });


    const users = [];
    fs.createReadStream('users.csv')
      .pipe(csv())
      .on('data', (data) => {
        users.push(data);
      })
      .on('end', async () => {
        for (const user of users) {
          const query = `
            INSERT IGNORE INTO users(full_name, id_document, address, city, phone_number, email) 
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          const values = [user.full_name, user.id_document, user.address, user.city, user.phone_number, user.email];
          await client.execute(query, values);
        }

        console.log('Usuarios cargados exitosamente.');
        await client.end();
      });

  } catch (err) {
    console.error('Error cargando usuarios:', err.message || err);
    if (client) await client.end();
  }
}




module.exports = {
  uploadUsersFromCSV
};