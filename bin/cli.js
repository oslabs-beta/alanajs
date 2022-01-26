#!/usr/bin/env node
import { program, Command } from 'commander';
import path, {dirname} from 'path';
import fs from 'fs';
import {writeFile, appendFile} from 'fs/promises';
import dotenv from 'dotenv';
import { IAMClient, GetPolicyCommand } from '@aws-sdk/client-iam';

import {AwsBucket, AwsParams, AwsRole, LambdaBasicARN} from '../methods/util/aws.js';
import iam from '../methods/iam.js';
import lambda from '../methods/lambda.js';
import s3 from '../methods/s3.js';
import zip from '../methods/zip.js';
import archiver from '../methods/archiver.js';
import { intro, starting, error, fail, finished, code } from '../methods/util/chalkColors.js';
import API from '../methods/gateway.js';

dotenv.config();

const hasCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION);
const defaultRole = 'defaultLambdaRole2';
const defaultBucket = 'defaultbucketny30'; //need random string alana+number or Date.now

console.clear();

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

if (!hasCredentials) {
  program
    . addHelpText('before', intro('Welcome to AWS as Nice as JavaScript (ALANA.js).')
  + '\nNo AWS credentials were found, so start by issuing the following command:\n\n     '
  + code('ami init <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY>')
  + '\n\nThere are additional options as well. Once the AWS credentials are entered, more options are available to you.'
  + '\nCheck out help by attaching the -h or --help flag to the command line'
  + '\n see below for the command line usage\n');
} 

program 
  .command('init')
  .description('run this to configure access to AWS')
  .argument('<AWS_ACCESS_KEY_ID>', 'this is your AWS access key ID')
  .argument('<AWS_SECRET_ACCESS_KEY>', 'this is your AWS secret access key')
  .argument('[region]', 'this is your preferred AWS region', 'us-east-1')
  .option('-r, --role <Role Name>', 'the AWS Role to be used', defaultRole)
  .option('-b, --bucket <S3 Bucket Name>', 'the name of the S3 bucket to be used', defaultBucket)
  .option('-u, --update', 'set this flag to override and update AWS credentials')
  .action(async (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, region, options) => {
    
    // check if .gitignore exists
    if (!fs.existsSync(path.resolve('./.gitignore'))) {
    
      // if it doesn't exist, create it with .env
      await writeFile('./.gitignore', '.env')
        .catch(err => {
          console.log(error(`Error in creating ./.gitignore : ${err.message}`));
          return;
        });
      console.log('.gitignore Created');
    }

    else {
      // if it does exist, read gitignore
      fs.readFile('./.gitignore', async (err, data) => {
        
        // check for .env and add if it doesn't
        if (!data.includes('.env')) {

          //append onto gitignore
          await appendFile('./.gitignore', '.env')
            .catch(err => {
              console.log(error(`Error in appending to ./.gitignore : ${err.message}`));
            });
          console.log('.env Added');
        }
      });
    }
    
    // test to see if the credentials are good
    const credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    };
    
    const awsParams = {
      'region': region,
      'credentials': credentials,
    };
    
    const iamClient = new IAMClient(awsParams);
    
    console.log('Verifying AWS credentials...');
    const response = await iamClient.send(new GetPolicyCommand({PolicyArn:LambdaBasicARN}))
      .catch(error => {
        // error handling.
        console.log(fail(error.message));
        return;
      });
    if (!response) return;
    
    console.log(finished('AWS Credentials verified.'));
    
    // create the aws credentials string
    const awsID = `AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}\n`;
    const awsKey = `AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}\n`;
    const awsRegion = `AWS_REGION=${region}\n`;
    const bucket = `S3BUCKETNAME=${options.bucket}\n`;
    const role = `ROLENAME=${options.role}\n`;

    // check if .env exists
    if (!fs.existsSync(path.resolve('./.env'))) {
      //if it doesn't exist, create it with .env
      await writeFile('./.env', awsID + awsKey + awsRegion + bucket + role)
        .catch(err => {
          console.log(error(`Error writing to the file ./.env : ${err.message}`));
          return;
        });
      console.log('.env Created');
      console.log(finished('AWS configuration finished!'));
    }
    else {

      //if it does exist, check for check for aws credentials
      fs.readFile('./.env', 'utf8', async (err, data) => {

        
        // if there is an option to update
        if (options.update) {
          // split up the data into an array
          const data_array = data.split('\n');
          // use a helper function to determine the data to delete
          const textLine = (text) => {
            for (let i = 0; i < data_array.length; i++) {
              if (data_array[i] && data_array[i].match(text)) {
                return i;
              }
            }
          };
            // delete the two main arguments
          delete data_array[textLine('AWS_ACCESS_KEY_ID')];
          delete data_array[textLine('AWS_SECRET_ACCESS_KEY')];

          // if there are options
          if (region !== 'us-east-1') delete data_array[textLine('AWS_REGION')];
          if (options.role && options.role !== defaultRole) delete data_array[textLine('ROLENAME')];
          if (options.bucket && options.bucket !== defaultBucket) delete data_array[textLine('S3BUCKETNAME')];

          // turn back into string while ignoring whitespaces
          data = '';
          data_array.forEach(el => {
            if (el !== '') data += el + '\n';
          });
        }

        // add all updated parameters
        if (!data.includes('AWS_ACCESS_KEY_ID')) {
          data += awsID;
          console.log('AWS Access Key ID Added');
        }
        if (!data.includes('AWS_SECRET_ACCESS_KEY')) {
          data += awsKey;
          console.log('AWS Secret Access Key Added');
        }
        if (!data.includes('AWS_REGION')) {
          data += awsRegion;
          console.log('AWS Region Added');
        }
        if (!data.includes('ROLENAME')) {
          data += role;
          console.log('Role Added');
        }
        if (!data.includes('S3BUCKETNAME')) {
          data += bucket;
          console.log('S3 Bucket Name Added');
        }

        //write it back to the .env file
        await writeFile('./.env', data)
          .catch(err => {
            console.log(error(`Error in modifying ./.env : ${err.message}`));
            return;
          });
       
        console.log('.env Modified');
        console.log(finished('AWS configuration finished!'));
      
      });
    }
    //*********** */ below console.log is showing up before .env modified. should show after
    // console.log(finished('AWS configuration finished!'));
  }

  );


// only show these if the user has input some credentials
if (hasCredentials) {
  program
    . addHelpText('before', intro('AWS as Nice as JavaScript (ALANA.js)')
    + '\nUsage Examples:\n\n     '
    + code('ami init <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY>     ') + '- enters a new AWS ID and Key\n     '
    + code('ami list                                                 ') + '- gets a table of all current AWS Lambda funcsions\n     '
    + code('ami create hello hello.js file1.js file2.js              ') + '- creates a Lambda function named hello where the definition is located in hello.js\n'
    + '                                                                with dependencies in file1.js and file2.js\n     '
    + code('ami update foo codeV2.js                                 ') + '- updates the Lambda function named foo with the code located in codeV2.js\n     '
    + code('ami delete foo 2                                         ') + '- delete the Lambda function foo if it has a version 2\n     '
    + '\n\n see below for the command line usage\n');
  
  program
    .command('create')
    .description('allows you to create functions. will verify that the requirements exist and create them before attempting to creating a function.')
    .argument('[funcName]', 'the name of the Lambda function to be create. If not specified, will only verify and create requirements')
    .argument('[fileArr...]', 'the file array that needs to be inclided for the Lambda function')
    .option('-r, --role [role name]', 'specifying a different AWS role than default specifically for this function')
    .option('-b, --bucket <bucket name>', 'specifying a different S3 bucket name than default')
    .option('-d, --description <description text>', 'a description of what the function is supposed to do')
    .option('-p, --publish', 'publish a new version of the Lambda function')
    .option('-l, --layerName <layer name>', 'create AWS lambda layer')
    .description('zip and create lambda function')
    .action(async (funcName, fileArr, options) => {
      
      // do not create a function if the options don't exist
      if (Object.keys(options).length === 0){
        if (funcName && fileArr.length === 0) {
          console.log(error('File name(s) are required if a function is to be created'));
          return;
        }
        if (!funcName && fileArr.length === 0) {
          console.log(error('Function name and file name(s) are required if a function is to be created'));
          return;
        }
      }

      options.role ? await verifyRole((options.role || funcName || AwsRole), true) : await verifyRole(AwsRole, true);
      options.bucket ? await verifyBucket(options.bucket, true) : await verifyBucket(AwsBucket, true);
      
      if(options.layerName){
        
      }

      // ami create function1 functionfile1 -l layer1 -f layerfile1 layerfile2
      console.log(starting('Compressing files...')); 
      const outputZip = await archiver.zipFiles(fileArr);
      console.log(starting('Sending files to s3...'));
      const response = await s3.sendFile(outputZip, options.bucket);
      console.log(starting('Sending files to AWS Lambda...')); 
      if (response) await lambda.createFunction(outputZip, funcName, options);
      console.log(finished('Request completed: AWS Lambda function created'));
    });

  program
    .command('list')
    .description('list the lambda function names')
    .option('-f, --function <function name>', 'list a specific function versions')
    .action(async (options) => {
      if (options.function) {
        lambda.getFuncVersionList(options.function);
        return;
      }
      const list = await lambda.getFuncList();
      console.table(list);
    });

  program
    .command('delete')
    .argument('<funcName>')
    .argument('[qualifier]')
    .option('-n, --aliasName <aliasName>')
    .description('delete lambda function')
    .action( (funcName, qualifier) => {
      lambda.deleteFunction(funcName, qualifier);
      console.log(finished('Request complete: AWS Lambda function deleted')); 
    });

  program
    .command('update')
    .argument('<funcName>')
    .argument('<fileArr...>')
    .option('-d, --description <description text>', 'a description of what the function is supposed to do')
    .option('-p, --publish', 'publish a new version of the Lambda function')
    .description('zip and update lambda function')
    .action(async (funcName, fileArr, options) => {
      // console.log('options obj',options)
      const outputZip = `${fileArr}.zip`;
      console.log(starting('Compressing updated files...')); 
      await archiver.zipFiles(fileArr);
      console.log(starting('Sending files to s3...'));
      await s3.sendFile(outputZip);
      console.log(starting('Sending files to AWS Lambda...'));
      lambda.updateFunction(outputZip, funcName, options);
      console.log(finished('Request complete: AWS Lambda function updated')); 
    });

  program
    .command('roles')
    .description('interact with AWS Roles')
    .argument('[awsRole]', 'the name of the AWS role', defaultRole)
    .option('-r, --role <role name>', 'the name of the AWS role')
    .option('-c, --create', 'Creates role if it does not exist')
    .option('-l, --list', 'List all the roles in AWS')
    .option('--delete', 'delete the specified role')
    .action(async (awsRole, options) => {
      if (options.delete) {
        if (awsRole === defaultRole) {
          console.log(fail('Cannot delete default role. Change default role before deleting'));
          return;
        }
        let data;
        if (options.role) data = await iam.deleteRole(options.role);
        if (!options.role && awsRole !== defaultRole) data = await iam.deleteRole(awsRole);
        if (data) console.log(finished(`  AWS role '${options.role || awsRole}' deleted.`));
        return;
      }
      if (options.list) console.log(await iam.getRoleList());
      if (options.role) await verifyRole(options.role, options.create);
      if (!options.role && awsRole !== defaultRole) await verifyRole(awsRole, options.create);
    });

  program
    .command('buckets')
    .description('interact with AWS S3 buckets')
    .argument('[s3bucket]', 'the name of the AWS S3 bucket', defaultBucket)
    //ami buckets amybucket -c

    // Verifying the AWS S3 bucket named "amybucket"
    // Bucket doesn't exist
    // Creating an AWS S3 bucket named "amybucket"
    // There's an error with creating an S3 bucket: BucketAlreadyExists

    // ^^^ above error msg is confusing because it says it doesnt exist, then says bucket already exists
    .option('-b, --bucket <bucket name>', 'S3 bucket name')
    .option('-c, --create', 'Create the bucket if it does not exist')
    .option('-l, --list', 'List all the buckets in S3')
    .option('--delete', 'delete the specified bucket')
    .action(async (s3bucket, options) => {
      // console.log(await s3.getBucketList());
      if (options.delete) {
        if (s3bucket === defaultBucket) {
          console.log(fail('Cannot delete default bucket. Change default bucket before deleting'));
          return;
        }
        let data;
        if (options.bucket) data = await s3.deleteBucket(options.bucket);
        if (!options.bucket && s3bucket !== defaultBucket) data = await s3.deleteBucket(s3bucket);
        if (data) console.log(finished(`  S3 bucket '${options.bucket || s3bucket}' deleted.`));
        return;
      }
      if (options.list) console.log(await s3.getBucketList());
      if (options.bucket) await verifyBucket(options.bucket, options.create);
      if (!options.bucket && s3bucket !== defaultBucket) await verifyBucket(s3bucket, options.create);
    });

  program
    .command('run')
    .description('invokes an AWS Lambda function')
    .argument('<funcName>', 'the name of the AWS Lambda function')
    .argument('[params...]', 'the parameters being passed into the AWS Lambda function')
    .option('-v, --version <version number>', 'the version of the AWS Lambda function being invoked. Must exist')
    .action(async (funcName, params, options) => {
      lambda.invoke(funcName, params, options);
      console.log(finished('Request complete: Lambda function invoked'));
    });

  program 
    .command('createLayer')
    .description('creates an AWS Lambda layer')
    .argument('<layerName>', 'name of the created layer')
    .argument('<fileArr>', 'files to be converted into a Lambda layer')
    .action(async(layerName, fileArr) => {
      
      if(!fileArr || !layerName){
        console.log(error('both fileArr and layerName are required fields')); 
        return; 
      }
      const outputZip = `${fileArr}.zip`;
      console.log(starting('Compressing layer files...')); 
      await archiver.zipFiles(fileArr);
      
      console.log(starting('Sending files to S3...'));
      await s3.sendFile(outputZip);
      
      console.log(starting('Sending files to AWS Lambda...'));
      await lambda.createLambdaLayer(layerName, outputZip); 
      
      console.log(finished('Request complete: Lambda layers created'));
    }
    );  

  program 
    .command('addLayerToFunc')
    .description('adds AWS Lambda Layer to existant function')
    .argument('<funcName>', 'name of function to append')
    .option('-l, --layerName <layerName>')
    .option('-v, --layerVersion <layerVersion>')
    .action(async(funcName, options) => {

      const layerArr = [{layerName: options.layerName, layerVersion: options.layerVersion}]; 
      
      if(!funcName || !layerArr){
        console.log(error('funcName, layerName, and layerVersion are required fields')); 
        return; 
      }
      console.log(starting('Sending request to AWS Lambda...')); 
      await lambda.addLayerToFunc(funcName, layerArr); 
      console.log(finished('Request complete: Lambda layers added to function'));

    });  

    
  program 
    .command('alias')
    .description('Create alias function for each Lamda function')
    .argument('<funcName>', 'name of function to append')
    .argument('[version]', 'version of function to point')
    .option('-c, --create <aliasName>', 'Create the alias name if it does not exist')
    .option('-u, --update <aliasName>', 'Update the alias name')
    .option('-d, --delete <aliasName>', 'Delete the alias name')
    .action(async(funcName,version, options) => {

      if (Object.keys(options).length > 1) {
        console.log(error('Error: Please select 1 option.',options));
        return;
      }
    if (options.create){
      const aliasName = options.create;
      console.log(starting('Sending request to AWS Lambda...'));
      const response = await lambda.createAlias(funcName,version, aliasName); 
      if (response.$metadata.httpStatusCode === 200) console.log(finished('Request complete: Alias created')); 
    }

    else if (options.update){
      const aliasName = options.update;
      console.log(starting('Sending request to AWS Lambda...'));
      const response = await lambda.updateAlias(funcName,version, aliasName); 
      // console.log(response.$metadata.httpStatusCode === 200)
      if (response.$metadata.httpStatusCode === 200) console.log(finished('Request complete: Alias updated')); 
    }

    else if (options.deleteAlias){
      const aliasName = options.delete;
      console.log(starting('Sending request to AWS Lambda...'));
      const response = await lambda.deleteAlias(funcName, aliasName); 
      if (response.$metadata.httpStatusCode === 200) console.log(finished('Request complete: Alias deleted'));
    }

  });

  program
    .command('API')
    .action(async () => {
      // API.createGateway();
      // API.putMethod();
      // lambda.addPermission('testLambda');
      // API.putIntegration();
      // API.putIntegrationResponse();
      // API.putMethodResponse();
      // API.deployGateway();
        
      // lambda.getPolicy('testLambda');
  
  
      //createGateway - need gateway resource id from the return. this is ID in gateway.js
      //create role with gateway permissions - need to copy from existing role in IAM. I've only done this in the AWS console.
      //getResources - to get default route resource id. this is resource in gateway.js
      //putMethod - to add the Method handler from the client
      //putIntegration - to add the method to integration request. This adds the lambda invocation
      //putIntegrationResponse - to add the aws integration response from the lambda function
      //putMethodResponse - connects the integration response to the http method response
      //addPermission - adds the permission to the lambda function so it can be invoked by the api
      //deployGateway - not 100% sure but this updates everything in gateway so it can be called from the internet


});
  
  
program.parse();

// {
//   "Version": "2012-10-17",
//   "Id": "default",
//   "Statement": [
//     {
//       "Sid": "testLambda1643158953896",
//       "Effect": "Allow",
//       "Principal": {
//         "Service": "apigateway.amazonaws.com"
//       },
//       "Action": "lambda:InvokeFunction",
//       "Resource": "arn:aws:lambda:us-east-1:122194345396:function:testLambda",
//       "Condition": {
//         "ArnLike": {
//           "AWS:SourceArn": "arn:aws:execute-api:us-east-1:122194345396:razmirg6cb/*/GET/"
//         }
//       }
//     }
//   ]
// }