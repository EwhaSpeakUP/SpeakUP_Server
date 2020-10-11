var multer = require('multer'); 
var path   = require('path');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './temp')
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

app.post('/imginsert',multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') 
                    {
            return callback(res.end('이미지만 입력가능합니다.'), null)
        }
        callback(null, true)
    }
}).single('img'), function(req, res) {
 /*img is the name that you define in the html input type="file" name="img" */       

        var data = {
            table_column_name(your database table column field name) :req.file
        };
        var query = connection.query("Insert into tablename set ?" ,data,function(err, rows)      
        {                                                      
          if (err)
             throw err;
         res.redirect('/blog');
        });
        console.log(query.sql);
        console.log(req.file);
    });