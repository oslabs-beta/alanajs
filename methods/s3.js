import { S3Client, PutObjectCommand, CreateBucketCommand, GetBucketAclCommand, ListBucketsCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

import {AwsParams, AwsBucket} from './util/aws.js';
import { starting, code, error, finished } from './util/chalkColors.js';

// create the s3 client
const s3Client = new S3Client(AwsParams);

const s3 = {};

s3.getBucketList = async () => {
  console.log(starting('Getting the list of S3 buckets'));

  const data = await s3Client.send(new ListBucketsCommand({}))
    .catch(err => {
      console.log(error(`Error while getting S3 bucket list: ${err.message}`));
      return;
    });
  return data.Buckets;
};

// FuncName: verifyBucket
// Description: ASYNC. This will check to see if a bucket in aws exists
// input:
// bucket - a string containing the bucket name, or the default bucket name
//
// output:
// boolean if the bucket specified in input exists in S3
//
s3.verifyBucket = async (bucket = AwsBucket) => {
  console.log(starting(`Verifying the AWS S3 bucket named "${bucket}"`));

  // get a list of buckets
  const data = await s3Client.send(new ListBucketsCommand({}))
    .catch(err => {
      console.log(error(`Error while getting S3 bucket list: ${err.message}`));
      return;
    });

  // iterate through array and check Name against bucket
  for (const el of data.Buckets) {
    if (el.Name === bucket) return true;
  } 
  return false;
};

// FuncName: createBucket
// Description: this will create an s3 bucket
// input:
// bucketName - a string representing the s3 bucket name
//
s3.createBucket = async (bucketName = AwsBucket) => {
  console.log(starting(`Creating an AWS S3 bucket named "${bucketName}"`));

  // params needed to create a s3 bucket
  const params = {
    // bucket name
    Bucket: bucketName,
  };
  
  // create the bucket
  // Amazon S3 bucket names must be unique globally. If you get the "Bucket name already exists" or "BucketAlreadyExists" error, 
  // then you must use a different bucket name to create the bucket. These error messages indicate that another AWS account owns a bucket with the same name.
  const response = await s3Client.send(new CreateBucketCommand(params))
    .then(data => {
      // do something with data
      console.log(finished('  Finished creating a new S3 bucket.\n'));
      // console.log(data);
      return data;
    })
    .catch(err => {
      console.log(error(`There's an error with creating an S3 bucket: ${err.message}`));
      if (err.message === `BucketAlreadyExists`) {
        console.log(error('Amazon S3 bucket names must be unique globally. If you get the "Bucket name already exists" or "BucketAlreadyExists" error, then you must use a different bucket name to create the bucket. These error messages indicate that another AWS account owns a bucket with the same name.'));
      }
      return;
    });

};


// FuncName: sendFile
// Description: this will send the zip file to s3
// input:
// outputZip - a string representing the zip file that needs to be sent to S3
//
s3.sendFile = async (outputZip, bucketName = AwsBucket) => {
 
  console.log(starting(`Sending the file "${outputZip}" to the AWS S3 Bucket "${bucketName}"`));
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

  const data = await s3Client.send(new PutObjectCommand(params))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished sending file.\n'));
      return outputZip;
    })
    .catch(err => {
      // console.log(err);
      console.log(error(`Error sending file to the S3 bucket : ${err.message}`));
      return;
    });
  return data; 
};



s3.deleteBucket = async (bucketName) => {
  const params = {
    Bucket: bucketName
  };

  const data  = await s3Client.send(new DeleteBucketCommand(params))
    .catch(err => {
      console.log(error(`Problem with deleting S3 bucket : ${err.message}`));
      return;
    });
  return data;
};

export default s3;