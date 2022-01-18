import { LambdaClient, ListFunctionsCommand, CreateFunctionCommand, InvokeCommand } from '@aws-sdk/client-lambda';

import awsParams from './util/awsCredentials.js';

// create the lambda client
const lambdaClient = new LambdaClient(awsParams);

const lambdaController = {};

// FuncName: getFuncList
// Description: this will send a command to get all the function names
//
lambdaController.getFuncList = (req, res, next) => {
  console.log('      using lambdaController.getFuncList');
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
      next();
    })
    .catch(err => {
      console.log('Error in lambdaController.getFuncList: ', err);
      return next(err);
    });
};

// FuncName: invoke
// Description: this will invoke the function specified in the parameters
// input:
// req.body.funcName - the name of the function
// req.body.params - the parameters for the function
//
lambdaController.invoke = (req, res, next) => {
  console.log('      using lambdaController.invoke');
  
  //input parameters for running the aws lambda function
  const params = { 
    //needed function name
    FunctionName: req.body.funcName,

    // pass in arguments for the lambda function (input payload)
    Payload: JSON.stringify(req.body.params),

    //default options that we may not need to change
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
  };

  // invokecommand is a class that lets lambdaclient know that we want to run the function that is specified in the params 
  lambdaClient.send(new InvokeCommand(params)) 
    .then(data => {
      console.log(data);
      
      //This will output the invocation data log into a readable string
      console.log(Buffer.from(data.LogResult,'base64').toString('ascii'));

      // lambda client returns data.payload which is utf8 and  needs to be decoded and parsed
      const response = JSON.parse(new TextDecoder('utf-8').decode(data.Payload)); 
      // saves it locally
      res.locals.lambdaResponse = response;
      console.log(res.locals.lambdaResponse);
      next();
    })
    .catch(err => {
      console.log('Error in lambdaController.invoke: ', err);
      return next(err);
    });
};

// FuncName: createFunction
// Description: this will create the function based on the file given in the S3 bucket
// input:
// req.body.funcName - the name of the function
// req.body.params - the parameters for the function
//
lambdaController.createFunction = (req, res, next) => {
  console.log('      using lambdaController.createFunction');

  // parameters for lambda command
  const params = { 
    Code: {S3Bucket: 'testbucketny30', S3Key: 'Out.zip' },
    FunctionName: 'add3',
    Runtime: 'nodejs14.x',
    Handler: 'index.handler',
    Role: 'arn:aws:iam::122194345396:role/lambda-role'
  };

  //sends a command via lambdaClient to list all functions
  lambdaClient.send(new CreateFunctionCommand(params))
    .then(data => {
      console.log(data);   
      next();
    })
    .catch(err => {
      console.log('Error in lambda CreateFunctionCommand: ', err);
      return next(err);
    });
};


export default lambdaController;