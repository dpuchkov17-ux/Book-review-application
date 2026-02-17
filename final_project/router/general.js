const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");

const public_users = express.Router();

// Register a new user (PUBLIC)
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // validate input
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  // isValid(username) => true means username already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  // add user to shared users array (from auth_users.js)
  users.push({ username, password });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// Get the book list using async/await + Axios
public_users.get("/", async (req, res) => {
    try {
      const response = await axios.get("http://localhost:5000/");
  
      return res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books" });
    }
  });

// Task 11: Get book details based on ISBN using async/await + Axios
public_users.get("/axios/isbn/:isbn", async (req, res) => {
    try {
      const isbn = req.params.isbn;
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
  
      return res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book by ISBN" });
    }
  });
  
// Task 12: Get book details based on Author using Promise callbacks + Axios
public_users.get("/axios/author/:author", (req, res) => {
    const author = req.params.author;
  
    axios
      .get(`http://localhost:5000/author/${encodeURIComponent(author)}`)
      .then((response) => {
        return res.send(JSON.stringify(response.data, null, 4));
      })
      .catch((error) => {
        return res.status(500).json({ message: "Error fetching books by author" });
      });
  });
  
// Task 13: Get book details based on Title using async/await + Axios
public_users.get("/axios/title/:title", async (req, res) => {
    try {
      const title = req.params.title;
      const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
  
      return res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by title" });
    }
  });
  

// Get book review
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.send(JSON.stringify(books[isbn].reviews, null, 4));
});

module.exports.general = public_users;
