const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express'); // express library import
const app = express();
const {pool} = require('~/SpeakUP_Server/config/database'); //database pool가져오기

//const AWS = require('aws-sdk'); // library to control the aws infra
//AWS.config.region = 'ap-northeast-2';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extend:true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);


// connected with DB
const connection = mysql.createConnection({
	host: conf.host,
	user: conf.user,
	password: conf.password,
	port: conf.port,
	database: conf.database
});

connection.connect();

//var ec2 = new AWS.EC2();
//ec2.describeInstances({}, function(err, data){
//	console.log(err);
//	console.log(data);
//});

app.get('/', function(req, res){
	connection.query(
		"SELECT * FROM STUDENT",
		(err, rows, fields) => {
			res.send(rows);
		}
	);
	//res.send('-----DONE-----');
});

app.listen(80,function(){
	console.log('connect 80 port');
});

