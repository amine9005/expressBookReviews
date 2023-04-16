const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ 

  const userArray = users.filter((user)=>{
    if (username === user.username && password === user.password){
      return user
    }
  })

  if (userArray.length > 0){
    return true
  }
  return false
}

//only registered users can login
regd_users.post("/login", (req,res) => {

  const username = req.body.username
  const password = req.body.password

  if (!username || !password){
    return res.status(400).send("username or password is not provided!")
  }

  if (authenticatedUser(username,password)){
    let accessToken = jwt.sign({
      data:password
    },'access',{expiresIn:60 * 60})

    req.session.authorization = {
      accessToken , username
    }
    req.session.username = username
    return res.status(200).send("User successfully logged in")
  }
  return res.status(400).send("Invalid Login. Check username and password");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization['username']
  const isbn = parseInt(req.params.isbn)
  let book = books[isbn]

  if(book){
    const review = req.query.review;
    books[isbn]['reviews'][username] = review
    return res.status(200).send("review has been successfully added/updated");
  }
  return res.status(404).send("Unable to find the requested book");
});

regd_users.delete("/auth/review/:isbn",(req,res)=>{
  const isbn = req.params.isbn
  const book = books[isbn]
  const username = req.session.authorization['username']
  if (book){
    delete books[isbn]['reviews'][username]
    return res.status(200).send("review posted by "+username+" has been deleted ")
  }
  return res.status(404).send("Unable to find the book")
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
