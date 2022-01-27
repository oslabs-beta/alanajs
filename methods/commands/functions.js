import {verifyRole, verifyBucket} from '../methods/util/verifyAWS.js';

import lambda from '../methods/AWS/lambda.js';
import s3 from '../methods/AWS/s3.js';

import {AwsBucket, AwsRole } from '../methods/util/aws.js';
import archiver from '../methods/util/archiver.js';

import { intro, starting, error, fail, finished, code } from '../methods/util/chalkColors.js';

const lambdaFunctions = {};

lambdaFunctions.create = async (funcName, fileArr, options = {}) => {
  options.role ? await verifyRole((options.role || funcName || AwsRole), true) : await verifyRole(AwsRole, true);
  options.bucket ? await verifyBucket(options.bucket, true) : await verifyBucket(AwsBucket, true);

  // ami create function1 functionfile1 -l layer1 -f layerfile1 layerfile2
  console.log(starting('Compressing files...')); 
  const outputZip = await archiver.zipFiles(fileArr);
  console.log(starting('Sending files to s3...'));
  const response = await s3.sendFile(outputZip, options.bucket);
  console.log(starting('Sending files to AWS Lambda...')); 
  if (response) await lambda.createFunction(outputZip, funcName, options);
  console.log(finished('Request completed: AWS Lambda function created'));
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
  await lambda.deleteFunction(funcName, qualifier);
  console.log(finished('Request complete: AWS Lambda function deleted')); 
};

lambdaFunctions.update = async (funcName, fileArr, options) => {
  const outputZip = `${fileArr}.zip`;
  console.log(starting('Compressing updated files...')); 
  await archiver.zipFiles(fileArr);
  console.log(starting('Sending files to s3...'));
  await s3.sendFile(outputZip);
  console.log(starting('Sending files to AWS Lambda...'));
  lambda.updateFunction(outputZip, funcName, options);
  console.log(finished('Request complete: AWS Lambda function updated')); 
};

lambdaFunctions.invoke = async (funcName, params, options) => {
  lambda.invoke(funcName, params, options);
  console.log(finished('Request complete: Lambda function invoked'));
};

export default lambdaFunctions;