const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username) =>{
  let userswithsamename = users.filter((user) => user.username === username)
  if (userswithsamename.length > 0){
    return true
  }
  return false
}

public_users.post("/register", (req,res) => {
  const username = req.body.username
  const password = req.body.password

  if (username && password){
    if(!doesExist(username)){
      users.push({'username':username,'password':password})
      return res.status(200).send("User successfully registred. Now you can login")
    }
    return res.status(404).send("User already exists!")

  }
  return res.status(404).send("username or password is not provided!");
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

  let getAllBooks = new Promise((resolve,reject)=>{
    resolve(JSON.stringify(books,null,4))
    reject("Cannot get data")
  })

  getAllBooks.then(
    (data)=>res.status(200).send(data),
    (err)=> res.status(404).send(err)
  )

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn) 
  let getBookByISBN =  new Promise((resolve,reject)=>{
      if (books[isbn]){
        resolve(
          "book with ISBN "+isbn+" details : "+JSON.stringify(books[isbn],null,4)
        )
      }
      reject(
        "Unable to find book with ISBN: "+isbn
      )
  })

  getBookByISBN.then(
    (data) => res.status(200).send(data),
    (err)=>res.status(404).send(err)
  )
 });
  
// Get book details based on author

public_users.get('/author/:author',function (req, res) {
  const author = req.params.author
  let book = null

  let getBookByAuthor = new Promise((resolve,reject)=>{

    for (let key in books) {
      if ( books[key]['author'] === author){
        book = books[key]
        book['isbn'] = key
        const message = "Book with author named: "+author+" details"+JSON.stringify(book,null,4)
        resolve(message) 
      }
    }

    reject("can't find book with an author named: "+author)

  })
  
  getBookByAuthor.then(
    (data) =>res.status(200).send(data),
    (err)  =>res.status(404).send(err)
  )
  
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title
  let book = null

  let getBookByTitle = new Promise((resolve,reject)=>{
    for (let key in books){
      if(books[key]['title'] === title){
        book = books[key]
        book['isbn'] = key
        const message = "Book with title: "+title+" details "+JSON.stringify(book,null,4)
        resolve(message)
      }
    }
     reject("can't find book with the title: "+title)
  })

  getBookByTitle.then(
    (data) => res.status(200).send(data),
    (err)  => res.status(404).send(err)
  )
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn)
  if (books[isbn]){
    return res.status(200).send("Book with ISBN : "+ isbn+" Reviews: "+JSON.stringify(
      books[isbn]['reviews'],null,4
    ))
  }

  return res.status(400).send("Can't find a book with ISBN: ");
});

module.exports.general = public_users;
