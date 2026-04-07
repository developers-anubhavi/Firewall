const express = require('express');
const bcrypt = require('bcrypt');
const {poolPromise,sql} = require('../db');

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT ID, USERNAME, USERID, USERTYPE
      FROM USER_LOGIN
      ORDER BY ID DESC
    `);

    res.json(
      result.recordset.map((row) => ({
        id: row.ID,
        username: row.USERNAME,
        userid: row.USERID,
        usertype: row.USERTYPE,
      }))
    );
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

router.post("/users/add", async (req, res) => {
  try {
    const { username, userid, usertype, password } = req.body;

    if (!username || !userid || !usertype || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const pool = await poolPromise;

    const check = await pool.request()
      .input("username", sql.VarChar, username)
      .input("userid", sql.VarChar, userid)
      .query(`
        SELECT * FROM USER_LOGIN 
        WHERE USERNAME = @username OR USERID = @userid
      `);

    if (check.recordset.length > 0) {
      const existing = check.recordset[0];
      if (existing.USERNAME === username) {
        return res.status(409).json({ message: "Username already exists" });
      }
      if (existing.USERID === userid) {
        return res.status(409).json({ message: "User ID already exists" });
      }
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    await pool.request()
      .input("username", sql.VarChar, username)
      .input("userid", sql.VarChar, userid)
      .input("usertype", sql.VarChar, usertype)
      .input("password", sql.VarChar, hashedPwd)
      .query(`
        INSERT INTO USER_LOGIN (DTE, USERNAME, USERID, USERTYPE, PASSWORD, STATUS)
        VALUES (GETDATE(), @username, @userid, @usertype, @password, 'INACTIVE')
      `);

    res.json({ message: "User added successfully" });

  } catch (error) {
    console.error("Add user error:", error);
    res.status(500).json({ message: "Server error adding user" });
  }
});

router.delete("/users/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM USER_LOGIN WHERE ID = @id`);

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

module.exports = router;
