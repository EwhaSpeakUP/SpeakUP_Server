var AWS = require('aws-sdk');


var credentials = new AWS.SharedIniFileCredentials({profile:'default'});

AWS.config.update({ region : 'ap-northeast-2'});

var ec2 = new AWS.EC2({apiVersion:'2016-11-15'});

var params = {
	DryRun: false
};

ec2.describeInstances(params, function(err, data){
	if (err) {
		console.log("Error", err.stack);
	} else {
		console.log("Success", JSON.stringify(data));
	}
});

