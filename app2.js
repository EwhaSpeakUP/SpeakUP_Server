const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());
app.set("view engine", "ejs");
//let {PythonShell} = require('python-shell') ;
const S3 = require("./config/s3");

var student_id = 1771014;
var assign_id= 1;
var BUCKET_NAME = 'ewhaspeakupsource1';
var dir=assign_id+'/'+student_id+'/';
var params = { 
  Bucket: BUCKET_NAME,
  Delimiter: '',
  Prefix: 'hw_assign/'+dir 
}

S3.listObjects(params, function (err, data) {
            
  if(err) throw(err);
  var num = 0;
  var json_arr=[];
  console.log(data);
  var len = data.Contents.length;
  for(var i=0; i<len; i++){
      var str=data.Contents[i].Key;
      var c = str.replace('hw_assign/'+dir , '');
      if(c.startsWith('JSON')){
          json_arr.push(c);
          num=num+1;
          //console.log('s3://ewhaspeakupsource1/hw_assign/'+dir+c);
          //var param = {Bucket:BUCKET_NAME, Key : 'hw_assign/'+dir+c};
          //var file = require('fs').createWriteStream(c);
          //S3.getObject(param).createReadStream().pipe(file); //json 파일 저장
      }
  }
  console.log([num, json_arr]);
});