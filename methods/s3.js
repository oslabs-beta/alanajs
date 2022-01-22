import { S3Client, PutObjectCommand, CreateBucketCommand, GetBucketAclCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

import {AwsParams, AwsBucket} from './util/aws.js';
import { starting, code, error, finished } from './util/chalkColors.js';

// create the s3 client
const s3Client = new S3Client(AwsParams);

const s3 = {};

// FuncName: createBucket
// Description: this will create an s3 bucket
// input:
// bucketName - a string representing the s3 bucket name
//
s3.createBucket = async (bucketName = AwsBucket) => {
  console.log(starting(`Creating an AWS S3 bucket named ${bucketName}`));

  // params needed to create a s3 bucket
  const params = {
    // bucket name
    Bucket: bucketName,
  };
  
  // create the bucket
  const response = await s3Client.send(new CreateBucketCommand(params))
    .then(data => {
      // do something with data
      console.log(finished('  Finished creating a new S3 bucket.\n'));
      return response;
    })
    .catch(err => {
      console.log(error(`There's an error with creating an S3 bucket: ${err.message}`));
      return;
    });

};


// FuncName: sendFile
// Description: this will send the zip file to s3
// input:
// outputZip - a string representing the zip file that needs to be sent to S3
//
s3.sendFile = async (outputZip, bucketName = AwsBucket) => {
  console.log(starting(`Sending the file "${outputZip} to the AWS S3 Bucket "${bucketName}"`));
  // creates a file stream of the zip file
  const fileStream = fs.createReadStream(outputZip);
  
  const params = {
    // s3 bucket
    Bucket: bucketName,
    // Add the required 'Key' parameter using the 'path' module.
    Key: path.basename(outputZip),
    // Add the required 'Body' parameter
    Body: fileStream,
  };

  await s3Client.send(new PutObjectCommand(params))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished sending file.\n'));
      return outputZip;
    })
    .catch(err => {
      console.log(error(err.message));
      return;
    });
};

export default s3;