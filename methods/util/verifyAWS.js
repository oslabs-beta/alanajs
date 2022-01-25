import { IAMClient, GetPolicyCommand } from '@aws-sdk/client-iam';

import iam from '../iam.js';
import s3 from '../s3.js';
import { LambdaBasicARN } from './aws.js';
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
  // test to see if the credentials are good
  const credentials = {
    accessKeyId: id,
    secretAccessKey: key
  };
 
  const awsParams = {
    'region': region,
    'credentials': credentials,
  };

  const iamClient = new IAMClient(awsParams);

  console.log(starting('Verifying AWS credentials...'));

  const data = await iamClient.send(new GetPolicyCommand({PolicyArn:LambdaBasicARN}))
    .catch(error => {
      // error handling.
      console.log(fail(`  Error in verifying AWS credentials : ${error.message}`));
      return;
    });
  if (!data) return false;
  console.log(finished('  AWS Credentials verified.'));
  return true;
}

export {verifyRole, verifyBucket, checkConnection};