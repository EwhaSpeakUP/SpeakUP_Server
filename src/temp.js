const s3 = require('../config/s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const router = require('express').Router();
const express = require('express');
const app = express();
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'ewhaspeakupsource1',
        key : function(req, file, cb){
            cb(null, 'hello.png');
        }
    }),
    acl : 'public-read-write'
});

router.post('/',function(req, res){
    upload.single("file")(req,res, function(err){
        if(err instanceof multer.MulterError) {
            console.log(err);
        } else if (err ){
            console.log("unknown error");
        }
        console.log(req.body);
    })
});

app.use('/fileupload', router);
app.listen(3000);