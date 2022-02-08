import { STSClient, GetAccessKeyInfoCommand } from "@aws-sdk/client-sts";

import iam from '../AWS/iam.js';
import s3 from '../AWS/s3.js';
import {starting, finished, warning, fail} from './chalkColors.js';

// verifies that the role exists and create if create is true
async function verifyRole(roleName, create = false) {
  const verifyResult = await iam.verifyRole(roleName);
  verifyResult ? console.log(finished('  Role exists\n')) : console.log(fail('  Role doesn\'t exist\n'));
  if (create && !verifyResult) await iam.createRole(roleName);
}

// verifies  that the bucket exists and create if otherwise
async function verifyBucket(bucket, create = false) {
  if (bucket !== bucket.toLowerCase()) {
    console.log(fail('  AWS S3 buckets must be in lower case only'));
    return;
  }
  const verifyResult = await s3.verifyBucket(bucket);
  verifyResult ? console.log(finished('  Bucket exists\n')) : console.log(fail('  Bucket doesn\'t exist\n'));
  if (create && !verifyResult) await s3.createBucket(bucket);
}

async function checkConnection(id, key, account, region) {
  const credentials = {
    accessKeyId: id,
    secretAccessKey: key
  };
 
  const awsParams = {
    'region': region,
    'credentials': credentials,
  };

  const stsClient = new STSClient(awsParams);

  console.log(starting('Verifying AWS credentials...'));

  const data = await stsClient.send(new GetAccessKeyInfoCommand({AccessKeyId: id}))
    .catch(error => {
      // error handling.
      console.log(fail('\nError in verifying AWS credentials'));
      console.log(error.message);
      console.log(fail('Please ensure that the ID/Key from this specific user has admin rights.'));
      console.log('These privileges are required to properly create and execute commands in AWS.');
      console.log('If you do not wish to give this specific user admin privileges, please ensure the user has S3 and Lambda read/write permissions.');
      return;
    });
  if (!data) {
    if (!account) {
      console.log(fail('No account number was given'));
      console.log('Re-run initialization or see alanajs documentation on how to properly create the .ENV file.');
      return false;
    }
    else {
      console.log(warning('The .ENV file will be created with the account number provided.'));
      console.log(warning('The account number could not be verified, and problems may occur if account number is incorrect'));
      return account;
    }
  }
  if (account && data.Account !== account) {
    console.log(fail('\nError in matching account read from AWS and the account entered. Please verify if the account number is correct.'));
    return;
  }
  console.log(finished('  AWS Credentials verified.'));
  return data.Account;
}

export {verifyRole, verifyBucket, checkConnection};