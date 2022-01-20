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
// res.locals.outputZip - the zip file that needs to be sent to S3
//
s3Controller.sendFile = (req, res, next) => {
  console.log('    using S3Controller.sendFile');
  // creates a file stream of the zip file
  const fileStream = fs.createReadStream(res.locals.outputZip);
  // console.log(fileStream);
  
  const params = {
    // s3 bucket
    Bucket: 'testbucketny30',
    // Add the required 'Key' parameter using the 'path' module.
    Key: path.basename(res.locals.outputZip),
    // Add the required 'Body' parameter
    Body: fileStream,
  };

  s3Client.send(new PutObjectCommand(params))
    .then(data => console.log(data))
    .then(data => next());
};

s3Controller.createBucket = (req, res, next) => {
  // params needed to create a s3 bucket
  const params = {
    // bucket name
    Bucket: 'testbucketny34',
  };
  
  s3Client.send(new CreateBucketCommand(params))
    .then(data => {
      res.locals.data = data;
      next();
    });
};

s3Controller.sendFile2 = async (outputZip) => {
  console.log('    using S3Controller.sendFile');
  // creates a file stream of the zip file
  const fileStream = fs.createReadStream(outputZip);
  
  const params = {
    // s3 bucket
    Bucket: 'testbucketny30',
    // Add the required 'Key' parameter using the 'path' module.
    Key: path.basename(outputZip),
    // Add the required 'Body' parameter
    Body: fileStream,
  };

  let result = await s3Client.send(new PutObjectCommand(params));
};

export default s3Controller;