const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }
  
    // isValid(username) в этом проекте обычно означает "пользователь уже существует"
    if (isValid(username)) {
      return res.status(409).json({ message: "User already exists!" });
    }
  
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
  });



// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    res.send(books[isbn]);
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

  const author = req.params.author;

  let filterbyauthor = Object.values(books).filter((book) => {
    return book.author === author;
  });

  return res.send(JSON.stringify(filterbyauthor, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  let filterbytitle = Object.values(books).filter((book) => {
    return book.title === title;
  });

  return res.send(JSON.stringify(filterbytitle, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
const isbn = req.params.isbn;
if (books[isbn]) {
      return res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  
  });

module.exports.general = public_users;
