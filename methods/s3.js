import { S3Client, PutObjectCommand, CreateBucketCommand, GetBucketAclCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

import awsParams from './util/awsCredentials.js';
import { response } from 'express';

// create the s3 client
const s3Client = new S3Client(awsParams);

const s3 = {};

// FuncName: createBucket
// Description: this will create an s3 bucket
// input:
// bucketName - a string representing the s3 bucket name
//
s3.createBucket = async (bucketName) => {
  // params needed to create a s3 bucket
  const params = {
    // bucket name
    Bucket: bucketName,
  };
  
  // create the bucket
  const response = await s3Client.send(new CreateBucketCommand(params))
    .then(data => {
      // do something with data
    });

  return response;
};


// FuncName: sendFile
// Description: this will send the zip file to s3
// input:
// outputZip - a string representing the zip file that needs to be sent to S3
//
s3.sendFile = async (outputZip) => {
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

  await s3Client.send(new PutObjectCommand(params));
};

export default s3;