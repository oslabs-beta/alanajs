import { LambdaClient, ListFunctionsCommand, CreateFunctionCommand, InvokeCommand, UpdateFunctionCodeCommand, DeleteFunctionCommand } from '@aws-sdk/client-lambda';
import path from 'path';
import awsParams from './util/awsCredentials.js';

// create the lambda client
const lambdaClient = new LambdaClient(awsParams);

const lambdaController = {};

// FuncName: getFuncList
// Description: this will send a command to get all the function names
//
// output:
// res.locals.functionList - an array of function names as strings
//
lambdaController.getFuncList = (req, res, next) => {
  console.log('      using lambdaController.getFuncList');
  //parameters for lambda command
  const params = { FunctionVersion: 'ALL' };

  //sends a command via lambdaClient to list all functions
  lambdaClient.send(new ListFunctionsCommand(params))
    .then(data => {
      // console.log(data);

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

lambdaController.getFuncList2 = () => {
  console.log('      using lambdaController.getFuncList');
  // console.log('this is awsParams',awsParams);
  //parameters for lambda command
  const params = { FunctionVersion: 'ALL' };

  //sends a command via lambdaClient to list all functions
  lambdaClient.send(new ListFunctionsCommand(params))
    .then(data => {
      // console.log(data);

      //parses out the function names from the functionList
      const functionList = data.Functions.map((el) => el.FunctionName);
      // res.locals.functionList = functionList;
      console.log('functionList: ', functionList);
      // next();
    })
    .catch(err => {
      console.log('Error in lambdaController.getFuncList: ', err);
      // return next(err);
    });
};

// FuncName: invoke
// Description: this will invoke the function specified in the parameters
// input:
// req.body.funcName - the name of the function
// req.body.params - the parameters for the function
//
// output:
// res.locals.lambdaResponse - the invocation response
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
// req.body.funcName - the name of the function, user input 
// res.locals.outputZip - the file name of the zip file
//
lambdaController.createFunction = (req, res, next) => {
  console.log('      using lambdaController.createFunction');
  console.log('outputzip in createFunc', res.locals.outputZip, 'end of outputzip');
  // parameters for lambda command
  const params = { 
    Code: {S3Bucket: 'testbucketny30', S3Key: res.locals.outputZip },
    FunctionName: req.body.funcName,
    Runtime: 'nodejs14.x',
    Handler: 'index.handler',
    Role: 'arn:aws:iam::122194345396:role/lambda-role'
  };
  //sends a command via lambdaClient to create a function
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


lambdaController.createFunction2 = (outputZip, funcName) => {
  console.log('      using lambdaController.createFunction2');

  // parameters for lambda command
  const params = { 
    Code: {S3Bucket: 'testbucketny30', S3Key: outputZip },
    FunctionName: funcName,
    Runtime: 'nodejs14.x',
    Handler: 'index.handler',
    Role: 'arn:aws:iam::122194345396:role/lambda-role',
  };

  //sends a command via lambdaClient to create a function
  lambdaClient.send(new CreateFunctionCommand(params))
    .then(data => {
      // console.log(data);   
      // next();
    })
    .catch(err => {
      console.log('Error in lambda CreateFunctionCommand: ', err);
      // return next(err);
    });
};

// FuncName: updateFunction
// Description: this will update the function FunctionName based on the file given in the S3 bucket
// input:
// req.body.funcName - the name of the function, user input 
// res.locals.outputZip - the file name of the zip file
//
lambdaController.updateFunction = (req, res, next) => {
  console.log('    using lambdaController.updateFunction'); 
  console.log('req.body.funcName', req.body.funcName); 
  // params for lambda command
  const params = {
    FunctionName: req.body.funcName, 
    Publish: true, 
    S3Bucket: 'testbucketny30', 
    S3Key: path.basename(res.locals.outputZip)
  };
  
  // send the update function command
  lambdaClient.send(new UpdateFunctionCodeCommand(params))
    .then(data => {
      console.log(data);
      next();
    })
    .catch(err => {
      console.log('Error in lambda updateFunctionCode:', err); 
      return next(err); 
    });
};

lambdaController.updateFunction2 = (outputZip, funcName) => {
  console.log('    using lambdaController.updateFunction'); 
  console.log('funcName', funcName); 
  // params for lambda command
  const params = {
    FunctionName: funcName, 
    Publish: true, 
    S3Bucket: 'testbucketny30', 
    S3Key: path.basename(outputZip)
  };
  
  // send the update function command
  lambdaClient.send(new UpdateFunctionCodeCommand(params))
    .then(data => {
      // console.log(data);
      // next();
    })
    .catch(err => {
      console.log('Error in lambda updateFunctionCode:', err); 
      // return next(err); 
    });
};

// FuncName: deleteFunction
// Description: this will delete the function FunctionName
// input:
// req.body.funcName - the name of the function, user input 
//
lambdaController.deleteFunction = (req, res, next) => {
  console.log('    using lambdaController.deleteFunction');

  // parameters for lambda command
  //qualifier: optional version to delete
  const params = { 
    FunctionName: req.body.funcName,
    Qualifier: '1'
  };

  lambdaClient.send(new DeleteFunctionCommand(params))
    .then(data => {
      console.log(data);   
      next();
    })
    .catch(err => {
      console.log('Error in lambda DeleteFunctionCommand: ', err);
      return next(err);
    });
};


export default lambdaController;