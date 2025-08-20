# Local MySQL Setup

---

## 1) Prerequisites

* **MySQL Community Server 8.x** (free): [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
* Optional GUI: **MySQL Workbench**
* A terminal (Command Prompt/PowerShell on Windows; Terminal on macOS/Linux)

---

## 2) Install MySQL

### Windows

1. Download **MySQL Installer** from the official site.
2. Choose a setup that includes **MySQL Server** (and optionally **MySQL Workbench**).
3. During configuration:

   * Configuration type: **Standalone** (or Developer Default).
   * Set a **root password** (save it!).
   * Optionally create a standard user.
4. Finish the installer. The Windows service is typically named **MySQL80**.

### macOS

* **With Homebrew**

  ```bash
  brew install mysql
  brew services start mysql
  ```
* **With .dmg**: Run the pkg installer and follow the prompts.

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl enable --now mysql
```

Then secure the installation:

```bash
sudo mysql_secure_installation
```

---

## 3) Start/Verify the MySQL Service

* **Windows**: Open **Services** → find **MySQL80** → Status should be **Running**. If not: Right‑click → **Start**.
* **macOS**: `brew services start mysql` (or use the System Settings if installed via .dmg)
* **Linux**: `sudo systemctl status mysql` (start with `sudo systemctl start mysql`)

---

## 4) (Windows) Make `mysql` work from any terminal (PATH trick)

If `mysql` is “not recognized”, add MySQL’s **bin** folder to the **PATH**:

1. Find your install path (default):

   ```
   C:\Program Files\MySQL\MySQL Server 8.0\bin
   ```
2. Start Menu → **Edit the system environment variables** → **Environment Variables…**
3. Under **System variables**, select **Path** → **Edit** → **New** → paste the `bin` path above.
4. **OK** all dialogs and **restart** your terminal (CMD/PowerShell).

> Quick alternative (without editing PATH):
>
> ```powershell
> cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
> .\mysql -u root -p
> ```
>
> (Note the `./` or `.\` prefix is required in PowerShell when running a program from the current directory.)

---

## 5) Connect to MySQL on localhost

From a terminal:

```bash
mysql -h localhost -P 3306 -u root -p
```

If prompted, enter the **root password** you set during installation.

**Workbench connection template**:

* Hostname: `localhost`
* Port: `3306`
* Username: `root`
* Password: (your password)

---

## 6) Create a database and schema (example)

Once inside the MySQL prompt (`mysql>`):

```sql
-- 1) Create and select your database
CREATE DATABASE IF NOT EXISTS app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE app_db;

-- 2) Create a sample table
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  id_document VARCHAR(45) NOT NULL,
  address VARCHAR(80) NOT NULL,
  city VARCHAR(90) NOT NULL,
  phone_number VARCHAR(90) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE
);

-- 3) Verify
SHOW TABLES;
DESCRIBE users;
```

---

## 7) Create a non‑root application user (recommended)

```sql
-- create a local-only user with its own password
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'ChangeThisStrongPassword!';

-- grant privileges ONLY to your database (safer than global privileges)
GRANT ALL PRIVILEGES ON app_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
```

Exit and test logging in with this user:

```bash
mysql -h localhost -P 3306 -u app_user -p app_db
```

---

## 8) (Optional) Connect from code

**Node.js (mysql2)**

```js
const mysql = require('mysql2/promise');

async function main() {
  const pool = await mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'app_user',
    password: 'ChangeThisStrongPassword!',
    database: 'app_db'
  });

  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users');
  console.log(rows);
}

main().catch(console.error);
```

**Python (mysql-connector-python)**

```python
import mysql.connector as mysql

conn = mysql.connect(
    host='localhost', port=3306,
    user='app_user', password='ChangeThisStrongPassword!',
    database='app_db'
)
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM users')
print(cur.fetchone())
cur.close(); conn.close()
```

---

## 9) Common issues & fixes

**❌ `mysql` is not recognized (Windows)\`**

* Add `C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin` to **PATH** (see section 4) or run from that folder with `.\\mysql`.

**❌ Access denied for user**

* Ensure you’re connecting as the correct user (`root` or `app_user`) and to the correct **host** (`localhost`).
* Re-grant and flush:

  ```sql
  GRANT ALL PRIVILEGES ON app_db.* TO 'app_user'@'localhost';
  FLUSH PRIVILEGES;
  ```

**❌ MySQL service not running**

* Windows: Open **Services** → start **MySQL80**.
* macOS/Linux: `sudo systemctl start mysql` (or `brew services start mysql` on macOS/Homebrew).

**❌ Port 3306 in use**

* Stop conflicting services or change MySQL port:

  * Windows: Edit `my.ini` (often in the MySQL install dir) → set `port=3307` under `[mysqld]`, restart service.
  * Linux/macOS: Edit `/etc/mysql/my.cnf` or `/etc/mysql/mysql.conf.d/mysqld.cnf` → `port=3307`, restart.
  * Connect with `-P 3307`.

---

## 10) Quick checklist for your README

* [ ] Install MySQL Community Server (no Docker)
* [ ] Start service (Windows: **MySQL80**; macOS: `brew services`; Linux: `systemctl`)
* [ ] (Windows) Add `.../MySQL Server 8.0/bin` to **PATH**
* [ ] Connect: `mysql -h localhost -P 3306 -u root -p`
* [ ] Create DB & tables (SQL in section 6)
* [ ] Create non-root user & grant (section 7)
* [ ] (Optional) Test from code (section 8)

---

### Copy-paste block for README (minimal)

```bash
# Start/verify MySQL
# Windows: Services -> MySQL80 (Running)
# macOS: brew services start mysql
# Linux: sudo systemctl enable --now mysql

# Connect as root
mysql -h localhost -P 3306 -u root -p

# In the MySQL prompt
CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  id_document VARCHAR(45) NOT NULL,
  address VARCHAR(80) NOT NULL,
  city VARCHAR(90) NOT NULL,
  phone_number VARCHAR(90) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE
);
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'ChangeThisStrongPassword!';
GRANT ALL PRIVILEGES ON app_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

# Test login as app_user
disconnect
mysql -h localhost -P 3306 -u app_user -p app_db
```

> **Tip (Windows):** If `mysql` is not recognized, add `C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin` to PATH, or run from that folder with `.\\mysql`.

