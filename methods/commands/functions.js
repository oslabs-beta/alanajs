import {verifyRole, verifyBucket} from '../util/verifyAWS.js';

import lambda from '../AWS/lambda.js';
import s3 from '../AWS/s3.js';

import {AwsBucket, AwsRole } from '../util/aws.js';
import archiver from '../util/archiver.js';

import { intro, starting, error, fail, finished, code } from '../util/chalkColors.js';

const lambdaFunctions = {};

lambdaFunctions.create = async (funcName, fileArr, options = {}) => {
  options.role ? await verifyRole((options.role || funcName || AwsRole), true) : await verifyRole(AwsRole, true);
  options.bucket ? await verifyBucket(options.bucket, true) : await verifyBucket(AwsBucket, true);

  let created;
  // alana create function1 functionfile1 -l layer1 -f layerfile1 layerfile2
  console.log(starting('Compressing files...')); 
  const outputZip = await archiver.zipFiles(fileArr);
  console.log(starting('Sending files to s3...'));
  const response = await s3.sendFile(outputZip, options.bucket);
  console.log(starting('Sending files to AWS Lambda...')); 
  if (response) created = await lambda.createFunction(outputZip, funcName, options);
  // console.log('response',response);
  if (created.$metadata.httpStatusCode < 300) console.log(finished('Request completed: AWS Lambda function created'));
};

lambdaFunctions.list = async (options) => {
  if (options.function) {
    lambda.getFuncVersionList(options.function);
    return;
  }
  const list = await lambda.getFuncList();
  console.table(list);
};

lambdaFunctions.delete = async (funcName, qualifier) => {
  const response = await lambda.deleteFunction(funcName, qualifier);
  if (response.$metadata.httpStatusCode < 300) console.log(finished('Request complete: AWS Lambda function deleted')); 
};

lambdaFunctions.update = async (funcName, fileArr, options) => {
  // const outputZip = `${fileArr}.zip`;
  let updated;
  console.log(starting('Compressing updated files...')); 
  const outputZip = await archiver.zipFiles(fileArr);
  // await archiver.zipFiles(fileArr);
  console.log(starting('Sending files to s3...'));
  const response = await s3.sendFile(outputZip);
  console.log(starting('Sending files to AWS Lambda...'));
  if (response) updated = await lambda.updateFunction(outputZip, funcName, options);
  if (updated.$metadata.httpStatusCode < 300) console.log(finished('Request complete: AWS Lambda function updated')); 
};

lambdaFunctions.invoke = async (funcName, params, options) => {
  lambda.invoke(funcName, params, options);
  console.log(finished('Request complete: Lambda function invoked'));
};

export default lambdaFunctions;