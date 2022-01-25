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
import { intro, starting, error, fail, finished, code } from '../methods/util/chalkColors.js';
import { verify } from 'crypto';

dotenv.config();

const hasCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION);
const defaultRole = 'defaultLambdaRole2';
const defaultBucket = 'defaultbucketny30';

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
    await iamClient.send(new GetPolicyCommand({PolicyArn:LambdaBasicARN}))
      .catch(error => {
        // error handling.
        console.log(fail(error.message));
        return;
      });
    
    console.log('AWS Credentials verified.');
    
    // create the aws credentials string
    const awsID = `AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}\n`;
    const awsKey = `AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}\n`;
    const awsRegion = `AWS_REGION=${region}\n`;
    const bucket = `S3BUCKETNAME=${options.bucket}\n`;
    const role = `ARNNAME=${options.role}\n`;

    // check if .env exists
    if (!fs.existsSync(path.resolve('./.env'))) {
      //if it doesn't exist, create it with .env
      await writeFile('./.env', awsID + awsKey + awsRegion + bucket + role)
        .catch(err => {
          console.log(error(`Error writing to the file ./.env : ${err.message}`));
          return;
        });
      console.log('.env Created');
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
          if (options.role && options.role !== defaultRole) delete data_array[textLine('ARNNAME')];
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
        if (!data.includes('ARNNAME')) {
          data += role;
          console.log('ARN Name Added');
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
      
      });
    }

    console.log(finished('AWS configuration finished!'));
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
    .option('-la, --layerArr [layer arrays]', 'add AWS lambda layer to function')
    .description('zip and create lambda function')
    .action(async (funcName, fileArr, options) => {
    // console.log('in create');
      if (funcName && fileArr.length === 0) {
        console.log(error('File names are required if a function is to be created'));
        return;
      }
      options.role ? await verifyRole((options.role || funcName || AwsRole), true) : await verifyRole(AwsRole, true);
      options.bucket ? await verifyBucket(options.bucket, true) : await verifyBucket(AwsBucket, true);
      
      // do not create a function if the options don't exist
      if (!funcName && fileArr.length === 0) return;
      const outputZip = await zip.zipFiles(fileArr);
      const response = await s3.sendFile(outputZip, options.bucket);
      if (response) lambda.createFunction(outputZip, funcName, options);
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

  //node cli delete <funcname>
  program
    .command('delete')
    .argument('<funcName>')
    .argument('[qualifier]')
    .description('delete lambda function')
    .action( (funcName, qualifier) => {
      lambda.deleteFunction(funcName, qualifier);
    });

  program
    .command('update')
    .argument('<funcName>')
    .argument('<fileArr...>')
    .description('zip and update lambda function')
    .action(async (funcName, fileArr) => {
      const outputZip = `${fileArr}.zip`;
      await zip.zipFiles(fileArr);
      await s3.sendFile(outputZip);
      lambda.updateFunction(outputZip, funcName);
    });

  program
    .command('roles')
    .description('interact with AWS Roles')
    .argument('[awsRole]', 'the name of the AWS role', defaultRole)
    .option('-r, --role <role name>', 'the name of the AWS role')
    .option('-c, --create', 'Create the role if it does not exist')
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
    .option('-b, --bucket <bucket name>', 'S3 bucket name')
    .option('-c, --create', 'Create the bucket if it does not exist')
    .option('-l, --list', 'List all the buckets in S3')
    .option('--delete', 'delete the specified bucket')
    .action(async (s3bucket, options) => {
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
      await zip.zipFiles(fileArr);
      await s3.sendFile(outputZip);
      await lambda.createLambdaLayer(layerName, outputZip); 

    }
    );  

  program 
    .command('addLayerToFunc')
    .description('adds AWS Lambda Layer to existant function')
    .argument('<funcName>', 'name of function to append')
    .option('-la, --layerName <layerName>')
    .option('-lv, --layerVersion <layerVersion>')
    .action(async(funcName, options) => {

      const layerArr = [{layerName: options.layerName, layerVersion: options.layerVersion}]; 
      console.log(layerArr);
      if(!funcName || !layerArr){
        console.log(error('funcName, layerName, and layerVersion are required fields')); 
        return; 
      }

      await lambda.addLayerToFunc(funcName, layerArr); 

    });  
}


program.parse();