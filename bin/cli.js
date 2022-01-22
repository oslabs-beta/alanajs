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
const defaultARN = 'defaultLambdaRole';
const defaultBucket = 'defaultbucketny30';

console.clear();

// verifies that the role exists and create if create is true
async function verifyARN(roleName, create = false) {

  const verifyResult = await iam.verifyRole(roleName);
  if (verifyResult) console.log(verifyResult.Role);
  if (create) await iam.createRole(roleName);
}

// verifies  that the bucket exists and create if otherwise
async function verifyBucket(bucket) {
  await s3.createBucket(bucket);
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
  .option('-A, --arn <ARN Name>', 'the Amazon Resource Name to be used', defaultARN)
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
    const ARN = `ARNNAME=${options.arn}\n`;

    // check if .env exists
    if (!fs.existsSync(path.resolve('./.env'))) {
      //if it doesn't exist, create it with .env
      await writeFile('./.env', awsID + awsKey + awsRegion + bucket + ARN)
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
          if (options.ARN && options.ARN !== defaultARN) delete data_array[textLine('ARNNAME')];
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
        if (!data.includes('AWS_ACCESS_SECRET_KEY')) {
          data += awsKey;
          console.log('AWS Access Secret Key Added');
        }
        if (!data.includes('AWS_REGION')) {
          data += awsRegion;
          console.log('AWS Region Added');
        }
        if (!data.includes('ARNNAME')) {
          data += ARN;
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
    .description('this allows you create functions. aws ARNs, S3 buckets')
    .argument('[funcName]', 'the name of the Lambda function to be create')
    .argument('[fileArr...]', 'the file array that needs to be inclided for the Lambda function')
    .option('-A, --arn <arn name>', 'Amazon Resource Name (ARN)')
    .option('-b, --bucket <bucket name>', 'an alternate S3 bucket name if the default bucket is not wanted')
    .option('-d, --description <description text>', 'a description of what the function is supposed to do')
    .option('-p, --publish', 'publish a new version of the Lambda function')
    .description('zip and create lambda function')
    .action(async (funcName, fileArr, options) => {
    // console.log('in create');
      console.log(options);
      options.arn ? verifyARN(options.arn) : verifyARN(AwsRole);
      // options.bucket ? verifyBucket(options.bucket) : verifyBucket(AwsBucket);
      const outputZip = await zip.zipFiles(fileArr);
      await s3.sendFile(outputZip, options.bucket);
      lambda.createFunction(outputZip, funcName, options);
    });

  program
    .command('list')
    .description('list lambda functions')
    .action(async () => {
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
    .argument('[role]', 'the name of the AWS Role', defaultARN)
    .option('-A, --arn <arn name>', 'Amazon Resource Name (ARN)')
    .option('-c, --create', 'Create the role if it does not exist')
    .action(async (role, options) => {
      if (options.arn) await verifyARN(options.arn, options.create);
      if (!options.arn && role !== defaultARN) await verifyARN(role, options.create);
    });
}

program.parse();