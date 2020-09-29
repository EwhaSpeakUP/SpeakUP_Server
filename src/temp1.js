
const fs = require('fs');
const router = require('express').Router();
const fileDir = __dirname + '\temp\\';

const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({dest: "../temp/"});

app.post('/upload', upload.single('voice'), function(req,res){
    console.log(req.file);
    res.send("Uploaded :" + req.file);
}); 

app.listen(3000);

