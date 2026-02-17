const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

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

// Get the book list available in the shop
public_users.get("/", (req, res) => {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.send(JSON.stringify(books[isbn], null, 4));
});

// Get book details based on author
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author;

  const filterByAuthor = Object.values(books).filter((book) => book.author === author);

  return res.send(JSON.stringify(filterByAuthor, null, 4));
});

// Get all books based on title
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title;

  const filterByTitle = Object.values(books).filter((book) => book.title === title);

  return res.send(JSON.stringify(filterByTitle, null, 4));
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
