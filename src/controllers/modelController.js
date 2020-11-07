const { pool } = require('../../config/database');
const { createBucket } = require('../../config/s3');
var py = require('python-shell');

exports.model = async function (req, res){
   
    py.PythonShell.run('a.py', function (err) {
    if (err) throw err;
    console.log('finished');
    }); 
}