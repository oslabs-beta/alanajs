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
import {startingBucket, startingRegion, startingRole, startingFolder} from '../methods/util/default.js';
import { intro, starting, error, fail, finished, code } from '../methods/util/chalkColors.js';

dotenv.config();

const envFolder = process.env.FOLDER;

// local variables
const hasCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION);
const defaultBucket = AwsBucket || startingBucket;
const defaultRegion = AwsRegion || startingRegion;
const defaultRole = AwsRole || startingRole;
const defaultFolder = envFolder || startingFolder;

console.clear();

if (!hasCredentials) {
  program
    . addHelpText('before', intro('Welcome to alanajs.')
  + '\nNo AWS credentials were found, so start by issuing the following command:\n\n     '
  + code('alana init <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY>')
  + '\n\nThere are additional options as well. Once the AWS credentials are entered, more options are available to you.'
  + '\nCheck out help by attaching the -h or --help flag to the command line'
  + '\n see below for the command line usage\n');
} 

program 
  .command('init')
  . addHelpText('before', intro('alanajs\n')
    + 'This will initialize or update the .ENV file needed to run alanajs. Admin privileges are required to verify the account number\n'
    + 'as well as read/write privileges are needed to interact with S3, Lambda, and API Gateway. If the user ID and Key do not have these\n'
    + 'permissions, there may be unexpected errors when trying to create, invoke, or otherwise interact with AWS. Please ensure the ID and\n'
    + 'and Key are safely secured otherwise.\n'
    + '\nUsage Examples:\n\n     '
    + code('alana init id111 key2222 account3                          ') + '- enters a AWS ID and Key which will verify it against account3 \n     '
    + code('alana init id4 key5 -b bucket2 -u                          ') + '- updates the AWS ID and Key and sets the default bucket to bucket2\n     '
    + code('alana init id6 key7 -d Lambda -u                          ') + '- updates the AWS ID and Key and sets the default directory to to <root>/Lambda\n     '
    + '\n\n see below for the command line usage\n')
  .description('run this to configure access to AWS')
  .argument('<AWS_ACCESS_KEY_ID>', 'this is your AWS access key ID')
  .argument('<AWS_SECRET_ACCESS_KEY>', 'this is your AWS secret access key')
  .argument('[AWS_ACCOUNT]', 'this is your AWS account number')
  .argument('[region]', 'this is your preferred AWS region', defaultRegion)
  .option('-r, --role <Role Name>', 'the AWS Role to be used', defaultRole)
  .option('-b, --bucket <S3 Bucket Name>', 'the name of the S3 bucket to be used', defaultBucket)
  .option('-u, --update', 'set this flag to override and update AWS credentials')
  .option('-d, --directory <directory>', 'the directory that files to upload are located in', defaultFolder)
  .action(async (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ACCOUNT, region, options) => {
    await init(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ACCOUNT, region, options.role, options.bucket, options.directory, options.update);
  });


// only show these if the user has input some credentials
if (hasCredentials) {
  program
    . addHelpText('before', intro('alanajs')
    + '\nUsage Examples:\n\n     '
    + code('alana init <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY>     ') + '- enters a new AWS ID and Key\n     '
    + code('alana list                                                 ') + '- gets a table of all current AWS Lambda functions\n     '
    + code('alana create hello hello.js file1.js file2.js              ') + '- creates a Lambda function named hello where the definition is located in hello.js\n'
    + '                                                                with dependencies in file1.js and file2.js\n     '
    + code('alana update foo codeV2.js                                 ') + '- updates the Lambda function named foo with the code located in codeV2.js\n     '
    + code('alana delete foo 2                                         ') + '- delete the Lambda function foo if it has a version 2\n     '
    + '\n\n see below for the command line usage\n');
  
  program
  .command('create')
    .addHelpText('before', intro('alanajs')
    + '\nUsage Examples:\n\n     '
    + code('alana create testFunction function.js                      ') + '- creates a new Lambda function named testFunction from the file function.js\n     '
    + code('alana create testFunction function.js -d "description"     ') + '- creates a new Lambda function named testFunction from the file function.js and adds a description\n     '
    + code('alana create layer1 function.js                            ') + '- creates a new Lambda layer named layer1 from the file function.js\n     '
    + code('alana create -r testrole testfunction function.js          ') + '- creates a new Lambda layer named layer1 from the file function.js and give it the permission of testrole\n     '
    + '\n\n see below for the command line usage\n')
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
    .addHelpText('before', intro('alanajs\n')
    + 'This will get information about the Lambda functions by listing all or listing the versions\n'
    + '\nUsage Examples:\n\n     '
    + code('alana list -F                                              ') + '- lists all the Lambda functions\n     '
    + code('alana list -f test                                         ') + '- lists all the versions that exist of function test\n     '
    + '\n\n see below for the command line usage\n')
    .description('list the various items')
    .option('-F, --functions', 'list all the Lambda functions')
    .option('-f, --function <function name>', 'list a specific function versions')
    .action(async (options) => {
      if (options.functions) await lambdaFunctions.list(options);
    });

  program
    .command('delete')
    .addHelpText('before', intro('alanajs\n')
    + 'This will allow you to delete a specific Lambda function or a version\n'
    + '\nUsage Examples:\n\n     '
    + code('alana delete foo                                           ') + '- deletes the function foo\n     '
    + code('alana delete bar 5                                         ') + '- deletes the function bar version 5\n     '
    + '\n\n see below for the command line usage\n')
    .description('delete a lambda function')
    .argument('<funcName>')
    .argument('[qualifier]')
    .action( (funcName, qualifier) => {
      lambdaFunctions.delete(funcName, qualifier);
    });

  program
    .command('update')
    .addHelpText('before', intro('alanajs\n')
    + 'This will allow you to update a specific Lambda function or a version\n'
    + '\nUsage Examples:\n\n     '
    + code('alana update foo bar.js                                    ') + '- updates the function foo with the file bar.js\n     '
    + code('alana update foo bar.js -d "description"                   ') + '- updates the function foo with the file bar.js and description\n     '
    + code('alana update foo bar.js bar2.js folder/bar3.js             ') + '- updates the function foo with the file bar.js and dependencies bar2.js and bar3.js\n     '
    + '\n\n see below for the command line usage\n')
    .description('update a Lambda function')
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
    .addHelpText('before', intro('alanajs\n')
    + 'This will allow you to inteact with AWS IAM roles\n'
    + '\nUsage Examples:\n\n     '
    + code('alana roles -l                                             ') + '- list all the roles in AWS IAM\n     '
    + code('alana roles foobar                                         ') + '- DOES NOT WORK. An interaction method must be used\n     '
    + code('alana roles -r foobar -c                                   ') + '- creates a new role foobar to interact with Lambda\n     '
    + code('alana roles --delete foobar                                ') + '- will only delete the role foobar if it is not the default role\n     '
    + '\n\n see below for the command line usage\n')
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
    .addHelpText('before', intro('alanajs\n')
    + 'This will allow you to inteact with AWS S3 buckets. S3 buckets are globally namespaced, so there may\n'
    + 'be another user that already has the specific named bucket you want to create. Additionally S3 bucket names\n'
    + 'will need to be alpha numeric and lowercase only. It will not create if it does not follow this naming convention\n'
    + '\nUsage Examples:\n\n     '
    + code('alana buckets -l                                           ') + '- list all the buckets in the user AWS S3\n     '
    + code('alana buckets -b foobar -c                                 ') + '- creates a new bucket foobar\n     '
    + code('alana buckets --delete foobar                              ') + '- will only delete the bucket foobar if it is not the default role\n     '
    + '\n\n see below for the command line usage\n')
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
    .addHelpText('before', intro('alanajs\n')
    + 'This will invoke a function with a potential version specified\n'
    + '\nUsage Examples:\n\n     '
    + code('alana invoke foo                                           ') + '- This will invoke the Lambda function foo\n     '
    + code('alana invoke foo 2                                         ') + '- This will invoke the Lambda function foo version 2\n     '
    + '\n\n see below for the command line usage\n')
    .description('invokes an AWS Lambda function')
    .argument('<funcName>', 'the name of the AWS Lambda function')
    .argument('[params...]', 'the parameters being passed into the AWS Lambda function')
    .option('-v, --version <version number>', 'the version of the AWS Lambda function being invoked. Must exist')
    .action(async (funcName, params, options) => {
      lambdaFunctions.invoke(funcName, params, options);
    });

  program 
    .command('createLayer')
    .addHelpText('before', intro('alanajs\n')
    + 'This allows for creation of Lambda Layer dependencies. By default, the Layers need to be inside the folder\n'
    + 'nodejs/node_modules. This will automatically insert the files inside the correct directory structure\n'
    + '\nUsage Examples:\n\n     '
    + code('alana createLayer layer1 file1.js                          ') + '- this will create a Lambda layer named layer1 from file1.js\n     '
    + '\n\n see below for the command line usage\n')
    .description('creates an AWS Lambda layer')
    .argument('<layerName>', 'name of the created layer')
    .argument('<fileArr...>', 'files to be converted into a Lambda layer')
    .action(async(layerName, fileArr) => {
      await layers.create(layerName, fileArr);
    });  

  program 
    .command('addLayerToFunc')
    .addHelpText('before', intro('alanajs\n')
    + 'This attaches a specific Lambda Layer to a specific Lambda function\n'
    + '\nUsage Examples:\n\n     '
    + code('alana addLayerToFunc testFunc -l layer1                    ') + '- this will attach the Lambda Layer layer1 to the function testFunc\n     '
    + '\n\n see below for the command line usage\n')
    .description('adds AWS Lambda Layer to existant function')
    .argument('<funcName>', 'name of function to append')
    .option('-l, --layerName <layerName>')
    .option('-v, --layerVersion <layerVersion>')
    .action(async(funcName, options) => {
      await layers.addLayersToFunc(funcName, options);
    });  

    
  program 
    .command('alias')
    .addHelpText('before', intro('alanajs\n')
    + 'This lets you interact with Lambda function aliases\n'
    + '\nUsage Examples:\n\n     '
    + code('alana alias foo 3 -c test                                  ') + '- this will create an alias named test for the Lambda function foo version 3\n     '
    + code('alana alias test --delete alias3                           ') + '- this will delete the alias alias3 from the Lambda function test\n     '
    + '\n\n see below for the command line usage\n')
    .description('Create alias function for each Lamda function')
    .argument('<funcName>', 'name of function to append')
    .argument('[version]', 'version of function to point')
    .option('-c, --create <aliasName>', 'Create the alias name if it does not exist')
    .option('-u, --update <aliasName>', 'Update the alias name')
    .option('--delete <aliasName>', 'Delete the alias name')
    .action(async(funcName,version, options) => {

      if (Object.keys(options).length > 1) {
        console.log(error('Error: Please select 1 option.',options));
        return;
      }
      await aliases(funcName, version, options);
    });

    program
    .command('api')
    .addHelpText('before', intro('alanajs\n')
    + 'This lets you interact with API HTTP Gateway\n'
    + '\nUsage Examples:\n\n     '
    + code('alana api                                                  ') + '- this will list all the APIs in AWS\n     '
    + code('alana api -c testapi                                       ') + '- this will create an API named testapi\n     '
    + code('alana api -u testapi -d "this is a test api"               ') + '- this will update testapi with a description "this is a test api"\n     '
    + code('alana api -u testapi -v 5                                  ') + '- this will update testapi with to the version 5"\n     '
    + code('alana api --delete testapi                                 ') + '- this will delete the API named testapi\n     '
    + '\n\n see below for the command line usage\n')
    .description('interact with the APIs')
    .argument('[apiName]', 'name of the api to get information on. Blank for all')
    .option('-c, --create', 'create the API named if it doesn\'t exist')
    .option('-u, --update', 'updates the API')
    .option('-v, --version <version>', 'specify the version of the api')
    .option('-d, --description <description>', 'the description of the api')
    .option('--delete', 'delete the api')
    .action(async (apiName, method, route, funcName, options) => {
      await apis.api(apiName, method, route, funcName, options);
    });
    
  program
    .command('routes')
    .addHelpText('before', intro('alanajs\n')
    + 'This lets you interact with API HTTP Gateway routes\n'
    + '\nUsage Examples:\n\n     '
    + code('alana routes -c GET . testFunc                             ') + '- this will create a GET method integration to testFunc at the root endpoint\n     '
    + code('alana routes -c POST valid validateData -d "description"   ') + '- this will create a POST method integration to validateDate at the endpoint valid with a description\n     '
    + code('alana routes -u PUT abc foo                                ') + '- this will update the PUT method integration at root with the function foo\n     '
    + code('alana routes --delete GET .                                ') + '- this will delete the GET method integration at root\n     '
    + '\n\n see below for the command line usage\n')
    .description('interact with a route on the API of choice.')
    .argument('<apiName>', 'name of the api')
    .argument('[method]', 'type of HTTP request used to invoke')
    .argument('[route]', 'route to establish (use "." for root')
    .argument('[funcName]', 'the Lambda function that is invoked on the route')
    .option('-c, --create', 'create the route specified')
    .option('-u, --update', 'update the route specified')
    .option('-d, --description <description>', 'the description of the api')
    .option('--delete', 'delete the specified route')
    .action(async (apiName, method, route, funcName, options) => {
      await apis.routes(apiName, method, route, funcName, options);
    });

  program
    .command('deploy')
    .addHelpText('before', intro('alanajs\n')
    + 'This lets you deploy an API gateway. This defaults to autodeploy so any future updates will be reflected\n'
    + '\nUsage Examples:\n\n     '
    + code('alana deploy testapi                                       ') + '- this will deploy the API testapi to a randomly generated stage name\n     '
    + code('alana deploy testapi production -d "live api"              ') + '- this will deploy the API testapi to the stage named production with a description\n     '
    + '\n\n see below for the command line usage\n')
    .description('deploy the api to a staged name')
    .argument('<apiName>', 'name of the api')
    .argument('[stageName]', 'the name of the stage being deployed')
    .option('-d, --description <description>', 'the description of the stage being deployed')
    .action(async (apiName, stageName, options) => {
      await apis.deploy(apiName, stageName, options);
    });
}
  
program.parse();