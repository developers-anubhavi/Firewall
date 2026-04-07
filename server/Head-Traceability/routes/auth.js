const express = require('express');
const bcrypt = require('bcrypt');
const {poolPromise,sql} = require('../db');

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username & Password required" });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .query(`
        SELECT TOP 1 *
        FROM USER_LOGIN
        WHERE USERNAME = @username COLLATE Latin1_General_CS_AS
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ field: "username", message: "Invalid username" });
    }

    const user = result.recordset[0];
    const isPasswordMatch = await bcrypt.compare(password, user.PASSWORD);

    if (!isPasswordMatch) {
      return res.status(401).json({ field: "password", message: "Invalid password" });
    }

    await pool.request()
      .input("username", sql.VarChar, username)
      .query(`
        UPDATE USER_LOGIN
        SET STATUS = 'ACTIVE'
        WHERE USERNAME = @username
      `);

    res.json({
      message: "Login successful",
      username: user.USERNAME,
      usertype: user.USERTYPE
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { username } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("username", sql.VarChar, username)
      .query(`
        UPDATE USER_LOGIN
        SET STATUS = 'INACTIVE'
        WHERE USERNAME = @username
      `);

    res.json({ message: "Logged out" });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
