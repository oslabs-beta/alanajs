const aws = require('aws-sdk'); 

exports.handler = async(event) => {
    console.log(aws.VERSION); 
}; 
