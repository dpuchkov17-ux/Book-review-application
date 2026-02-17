const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");

const regd_users = express.Router();

// IMPORTANT: this users array is the single source of truth
let users = [];

const isValid = (username) => {
  // true if user already exists
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // validate input
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  // validate credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }

  // sign token
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  // save into session (session middleware is in index.js)
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review (protected by /customer/auth/* middleware in index.js)
// Example: PUT /customer/auth/review/1?review=Great%20book
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // 1) review must come from query string
    const review = req.query.review;
  
    if (!review) {
      return res.status(400).json({ message: "review query parameter is required" });
    }
  
    // 2) username must come from session (saved during login)
    const username = req.session?.authorization?.username;
    if (!username) {
      // technically your index.js middleware should block before this,
      // but we keep it safe
      return res.status(403).json({ message: "User not logged in" });
    }
  
    // 3) check book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // 4) ensure reviews object exists
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    // 5) add or overwrite review for this username
    // same user -> overwrite; different user -> separate key
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({
      message: "Review added/updated successfully",
      isbn,
      reviews: books[isbn].reviews
    });
  });
  
  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
  
    // 1) Check login (username stored in session during login)
    const username = req.session?.authorization?.username;
  
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    // 2) Check book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // 3) Check if review by this user exists
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  
    // 4) Delete only this user's review
    delete books[isbn].reviews[username];
  
    return res.status(200).json({
      message: "Review deleted successfully",
      isbn,
      remainingReviews: books[isbn].reviews
    });
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

