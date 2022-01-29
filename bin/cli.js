#!/usr/bin/env node
// npm packages
import { program, Command } from 'commander';
import dotenv from 'dotenv';

// commands
import lambdaFunctions from '../methods/commands/functions.js';
import layers from '../methods/commands/layers.js';
import aliases from '../methods/commands/aliases.js';
import roles from '../methods/commands/roles.js';
import buckets from '../methods/commands/buckets.js';
import apis from '../methods/commands/apis.js';

// init
import init from '../methods/util/generateEnv.js';

// consts
import {AwsBucket, AwsRegion, AwsRole } from '../methods/util/aws.js';
import {startingBucket, startingRegion, startingRole} from '../methods/util/default.js';
import { intro, starting, error, fail, finished, code } from '../methods/util/chalkColors.js';

// local variables
const hasCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION);
const defaultBucket = AwsBucket || startingBucket;
const defaultRegion = AwsRegion || startingRegion;
const defaultRole = AwsRole || startingRole;

dotenv.config();

console.clear();

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
  .argument('[region]', 'this is your preferred AWS region', defaultRegion)
  .option('-r, --role <Role Name>', 'the AWS Role to be used', defaultRole)
  .option('-b, --bucket <S3 Bucket Name>', 'the name of the S3 bucket to be used', defaultBucket)
  .option('-u, --update', 'set this flag to override and update AWS credentials')
  .action(async (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, region, options) => {
    await init(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, region, options.role, options.bucket, options.update);
  });


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

      lambdaFunctions.create(funcName, fileArr, options);

    });

  program
    .command('list')
    .description('list the lambda function names')
    .option('-f, --function <function name>', 'list a specific function versions')
    .action(async (options) => {
      await lambdaFunctions.list(options);
    });

  program
    .command('delete')
    .argument('<funcName>')
    .argument('[qualifier]')
    .option('-a, --aliasName <aliasName>')
    .description('delete lambda function')
    .action( (funcName, qualifier) => {
      lambdaFunctions.delete(funcName, qualifier);
    });

  program
    .command('update')
    .argument('<funcName>')
    .argument('<fileArr...>')
    .option('-d, --description <description text>', 'a description of what the function is supposed to do')
    .option('-p, --publish', 'publish a new version of the Lambda function')
    .description('zip and update lambda function')
    .action(async (funcName, fileArr, options) => {
      await lambdaFunctions.update(funcName, fileArr, options);
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
      await roles(awsRole, options);
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
      // console.log(await s3.getBucketList());
      await buckets(s3bucket, options);
    });

  program
    .command('run')
    .description('invokes an AWS Lambda function')
    .argument('<funcName>', 'the name of the AWS Lambda function')
    .argument('[params...]', 'the parameters being passed into the AWS Lambda function')
    .option('-v, --version <version number>', 'the version of the AWS Lambda function being invoked. Must exist')
    .action(async (funcName, params, options) => {
      lambdaFunctions.invoke(funcName, params, options);
    });

  program 
    .command('createLayer')
    .description('creates an AWS Lambda layer')
    .argument('<layerName>', 'name of the created layer')
    .argument('<fileArr...>', 'files to be converted into a Lambda layer')
    .action(async(layerName, fileArr) => {
      await layers.create(layerName, fileArr);
    });  

  program 
    .command('addLayerToFunc')
    .description('adds AWS Lambda Layer to existant function')
    .argument('<funcName>', 'name of function to append')
    .option('-l, --layerName <layerName>')
    .option('-v, --layerVersion <layerVersion>')
    .action(async(funcName, options) => {
      await layers.addLayersToFunc(funcName, options);
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
    
      await aliases(funcName, version, options);

    });

  // under development
  program
    .command('api')
    .argument('<apiName>', 'name of the api')
    .argument('<method>', 'type of HTTP request used to invoke')
    .argument('<route>', 'route to establish (use "." for root')
    .argument('<funcName>', 'the lambdaFunction to invoke from the request')
    .option('-d, --description <description>', 'the description of the API')
    .action(async (apiName, method, route, funcName, options) => {
      await apis(apiName, method, route, funcName, options);
    });

}
  
program.parse();