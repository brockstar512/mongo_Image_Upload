const express = require("express")
const bodyParser = require('body-parser')
const path = require("path")
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')

const app = express();

//middle ware
app.use(bodyParser.json())
app.use(methodOverride("_method"))//suppose to let us use a query string in order to make a delete request
app.set('view engine', 'ejs');
//this uses set to find the ejs index file in views

//Mongo URI
const mongoURI = 'mongodb://localhost/image_db'

//mongo connection
const conn = mongoose.createConnection(mongoURI)

//init GFS- initialize stream
let gfs;

conn.once('open',()=>{
    //init stream
    gfs =Grid(conn.db, mongoose.mongo)
    gfs.collection('uploads')
})

//create storage 
const storage = new GridFsStorage({
    url: mongoURI,
    file:(req,file)=>{
        return new Promise((resolve, reject)=>{
            //this will generate a 16 character name
            crypto.randomBytes(16,(err,buf)=>{
                if(err){
                    return reject(err)
                }
                //this will create the filename with the extention
                const filename = buf.toString('hex') + path.extname(file.originalname)
                //were going to create an object called file info
                const fileInfo ={
                    //we will create an object with the filname and a bucketname
                    filename: filename,
                    //buckename should be the cellection name
                    bucketName: "uploads"
                }
                //resolve the promise with the returning info object
                resolve(fileInfo)
            })
        })
    }
})
//this will create an upload variable and use multer to run the storage function
// console.log("here is multer",storage)
const upload = multer({ storage })

//
app.get('/', (req, res)=>{
res.render('index')
});

//post = upload

const port = 5000

app.listen(port, () => console.log(`server started on ${port}`))


// Multer is a NodeJS middleware which facilitates file uploads. 
//And GridFsStorage is GridFS storage engine for 
//Multer to store uploaded files directly to MongoDB.