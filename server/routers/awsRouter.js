import express from 'express';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { Lambda, LambdaClient, ListFunctionsCommand, AddLayerVersionPermissionCommand, CreateFunctionCommand, InvokeCommand } from '@aws-sdk/client-lambda';
import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand } from '@aws-sdk/client-iam';

// set up .env file accessibility
import dotenv from 'dotenv';
dotenv.config();

// Global variables
// root user credentials
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// set up AWS region
const region = process.env.AWS_REGION;

// create the lambda client
const lambdaClient = new LambdaClient({
  'region': region,
  'credentials': credentials,
});







//set up express router
const router = express.Router();

//initial route 
router.use('/', (req, res, next) => {
  console.log('  using awsRouter');
  next();
});


//on get to funcList
router.get('/funcList', (req, res, next) => {
  console.log('      awsRouter.getFunctionList');
 
  //parameters for lambda command
  const params = { FunctionVersion: 'ALL' };

  //sends a command via lambdaClient to list all functions
  lambdaClient.send(new ListFunctionsCommand(params))
    .then(data => {
      console.log(data);

      //parses out the function names from the functionList
      const functionList = data.Functions.map((el) => el.FunctionName);
      res.locals.functionList = functionList;
      console.log('functionList: ', res.locals.functionList);
      //   next();
    })
    .catch(err => {
      console.log('Error in lambda List Functions Command: ', err);
      return next(err);
    });
  res.status(200).json(res.locals.functionList);
});

//on get to command
router.get('/command', (req, res, next) => {
  console.log('      awsRouter.runCommand');
    
  
  //input parameters for running the aws lambda function
  const params = { 
    // //needed function name
    // FunctionName: 'testLambda',
    // //role
    // Role: 'arn:aws:iam::122194345396:role/lambda-role', 
    FunctionName: 'test2',
    Role: 'arn:aws:lambda:us-east-1:122194345396:function:test2',

    //pass in arguments for the lambda function (input payload)
    // Payload: {keyword: 'hello'},

    //default options that we may not need to change
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
  };

  lambdaClient.send(new InvokeCommand(params)) //--> invokecommand is a class that lets lambdaclient know that we want to run the function that is specified in the params 
    .then(data => {
      // lambda client returns utf8 which needs to be decoded and parsed
      const response = JSON.parse(new TextDecoder('utf-8').decode(data.Payload)); //--> data.payload is the result of the lambda function invocation
      //saves it locally
      res.locals.lambdaResponse = response;
      // next();
      console.log(res.locals.lambdaResponse);
      res.status(res.locals.lambdaResponse.statusCode).json(res.locals.lambdaResponse.body);
    })
    .catch(err => {
      console.log('Error in lambda function invokation: ', err);
      return next(err);
    });
});

router.use('/Sts', (req, res, next) => {
  console.log('    using sts');
  const stsClient = new STSClient({
    region: region,
    credentials: credentials,
  });
  const roleParams = {
    RoleArn: req.body.arn,
    RoleSessionName: 'ShepherdSession',
  };
    
  stsClient.send(new AssumeRoleCommand(roleParams))
    .then(data => {
      const accessKeyId = assumedRole.Credentials.AccessKeyId;
      const secretAccessKey = assumedRole.Credentials.SecretAccessKey;
      const sessionToken = assumedRole.Credentials.SessionToken;
      res.locals.credentials = { accessKeyId, secretAccessKey, sessionToken };
      return next();
    })
    .catch(err => {
      console.log('Error in lambda function invokation: ', err);
      return next(err);
    });
});


export default router;