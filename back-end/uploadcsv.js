import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { insertCSVData } from "./queries/queries.js";
import {client} from "./config/db.js";

dotenv.config();

// Function: uploadUsersFromCSV
async function uploadUsersFromCSV() {
  try {
    const users = [];
    fs.createReadStream("users.csv")
      .pipe(csv())
      .on("data", (data) => {
        // Validate user data before pushing
        if (
          data.full_name &&
          data.id_document &&
          data.address &&
          data.city &&
          data.phone_number &&
          data.email
        ) {
          users.push(data);
        } else {
          console.warn("Skipping invalid row:", data);
        }
      })
      .on("end", async () => {
        for (const user of users) {
          try {
            const query = insertCSVData;
            const values = [
              user.full_name,
              user.id_document,
              user.address,
              user.city,
              user.phone_number,
              user.email,
            ];
            await client.execute(query, values);
          } catch (err) {
            console.error("Error inserting user:", user, err.message);
          }
        }

        console.log("Users uploaded successfully.");
        await client.end();
      });
  } catch (err) {
    console.error("Error loading users:", err.message || err);
    if (client) await client.end();
  }
}

export { uploadUsersFromCSV };

