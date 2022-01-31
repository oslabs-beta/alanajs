import { STSClient, GetAccessKeyInfoCommand } from "@aws-sdk/client-sts";

import iam from '../AWS/iam.js';
import s3 from '../AWS/s3.js';
import {starting, finished, fail} from './chalkColors.js';

// verifies that the role exists and create if create is true
async function verifyRole(roleName, create = false) {
  const verifyResult = await iam.verifyRole(roleName);
  verifyResult ? console.log(finished('  Role exists\n')) : console.log(fail('  Role doesn\'t exist\n'));
  if (create && !verifyResult) await iam.createRole(roleName);
}

// verifies  that the bucket exists and create if otherwise
async function verifyBucket(bucket, create = false) {
  const verifyResult = await s3.verifyBucket(bucket);
  verifyResult ? console.log(finished('  Bucket exists\n')) : console.log(fail('  Bucket doesn\'t exist\n'));
  if (create && !verifyResult) await s3.createBucket(bucket);
}

async function checkConnection(id, key, region) {
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
      console.log(fail(`  Error in verifying AWS credentials : ${error.message}`));
      return;
    });
  if (!data) return false;
  console.log(finished('  AWS Credentials verified.'));
  return data.Account;
}

export {verifyRole, verifyBucket, checkConnection};