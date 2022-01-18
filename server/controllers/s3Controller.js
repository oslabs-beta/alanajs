import { S3Client, PutObjectCommand, CreateBucketCommand, GetBucketAclCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

import awsParams from './util/awsCredentials.js';

// create the s3 client
const s3Client = new S3Client(awsParams);

const s3Controller = {};

// FuncName: sendFile
// Description: this will send the zip file to s3
// input:
// currently hardcoded bucket and file
//
s3Controller.sendFile = (req, res, next) => {
  // creates a file stream of the zip file
  const fileStream = fs.createReadStream('out.zip');
  // console.log(fileStream);
  
  const uploadParams = {
    // s3 bucket
    Bucket: 'testbucketny30',
    // Add the required 'Key' parameter using the 'path' module.
    Key: path.basename('out.zip'),
    // Add the required 'Body' parameter
    Body: fileStream,
  };

  s3Client.send(new PutObjectCommand(uploadParams))
    .then(data => console.log(data));
};

s3Controller.createBucket = (req, res, next) => {
  const uploadParams = {
    // s3 bucket
    Bucket: 'testbucketny34',
    
  };
  
  s3Client.send(new CreateBucketCommand(uploadParams))
    .then(data => {
      res.locals.data = data;
      next();
    });
};

export default s3Controller;