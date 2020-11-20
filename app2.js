const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());
app.set("view engine", "ejs");
let {PythonShell} = require('python-shell') 

app.get("/view", function(req, res){
    fs.readFile( "./result.json", 'utf8', function (err, data) { // json 파일 위치 지정
        var model_result = JSON.parse(data);
        console.log(model_result);
        var result="<html><head><title>결과</title><script src='https://code.jquery.com/jquery-3.5.1.min.js'></script></head><body><div id='result'></div></body><script type='text/javascript'>"
        var item = model_result["결과"];
        for(i=0; i<item.length; i++){
          if (item[i]["tag"]=="0000") {result+="<font size=1 color=blue>"; result+=item[i]["result"]; result+=" </font>";}
          else if (item[i]["tag"]=="1000") {result+="<font size=3 color=black>"; result+=item[i]["result"]; result+=" </font>";}
          else if (item[i]["tag"]=="1001") {result+="<font size=3 color=red>"; result+=item[i]["result"]; result+=" </font>";}
        }
        result+="</script></html>";
        res.send(result);
  
        });
  })

  app.get("/view2", function(req, res){
    
        res.render('./view.ejs');
    
    
  });

  

  app.listen(5000, function () {
    console.log("Example app listening at http://localhost:5000");
  });
  