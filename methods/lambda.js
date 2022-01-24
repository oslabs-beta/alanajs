import { LambdaClient, ListFunctionsCommand, CreateFunctionCommand, InvokeCommand, UpdateFunctionCodeCommand, DeleteFunctionCommand, PublishLayerVersionCommand } from '@aws-sdk/client-lambda';
import path from 'path';

import {starting, error} from './util/chalkColors.js';
import { AwsParams, AwsBucket } from './util/aws.js';

// create the lambda client
const lambdaClient = new LambdaClient(AwsParams);


const lambda = {};

// FuncName: getFuncList
// Description: this will send a command to get all the function names
//
// output:
// functionList - an array of function names as strings
//
lambda.getFuncList = async () => {
  console.log(starting('Getting a list of Lambda functions'));
  // console.log('this is awsParams',awsParams);
  //parameters for lambda command
  const params = { FunctionVersion: 'ALL' };

  //sends a command via lambdaClient to list all functions
  const data = await lambdaClient.send(new ListFunctionsCommand(params))
    .catch(err => {
      console.log(error('Error in getting the Lambda Function list: ', err));
    });
  
  if (!data) return;
  //parses out the function names from the functionList into a console.table object
  const functionList = {};

  // creates a class called lambdaFunc
  function lambdaFunc(description, version, lastModified) {
    this.Description = description;
    this.Version = version;
    this.LastModified = lastModified;
  }
  
  data.Functions.map((el) => {
    functionList[el.FunctionName] = new lambdaFunc(el.Description, el.Version, el.LastModified.toLocaleString());
  });
  // res.locals.functionList = functionList;
  return functionList;
};

// FuncName: invoke
// Description: this will invoke the function specified in the parameters
// input:
// uncName - the name of the function
// params - the parameters for the function
//
// output:
// the invocation response
// 
lambda.invoke = (funcName, params) => {
  console.log('      using lambdaController.invoke');
  
  //input parameters for running the aws lambda function
  const lambdaParams = { 
    //needed function name
    FunctionName: funcName,

    // pass in arguments for the lambda function (input payload)
    Payload: JSON.stringify(params),

    //default options that we may not need to change
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
  };

  // invokecommand is a class that lets lambdaclient know that we want to run the function that is specified in the params 
  lambdaClient.send(new InvokeCommand(lambdaParams)) 
    .then(data => {
      console.log(data);
      
      //This will output the invocation data log into a readable string
      console.log(Buffer.from(data.LogResult,'base64').toString('ascii'));

      // lambda client returns data.payload which is utf8 and  needs to be decoded and parsed
      const response = JSON.parse(new TextDecoder('utf-8').decode(data.Payload)); 
      console.log(response);
      return response;
    })
    .catch(err => {
      console.log('Error in invoke: ', err);
      return err;
    });
};

// FuncName: createFunction
// Description: this will create the function based on the file given in the S3 bucket
// input:
// funcName - the name of the function, user input 
// outputZip - the file name of the zip file
//

lambda.createFunction = async(outputZip, funcName, options) => {
  // destructure and set defaults to options if not included;
  const {bucket = AwsBucket, description = undefined, layerArr = [''], publish = false} = options;

  console.log(`Creating the function "${funcName}" from the output file "${outputZip}" found in the S3 Bucket "${bucket}"`);
  
  // parameters for lambda command
  const params = { 
    Code: {S3Bucket: bucket, S3Key: outputZip },
    FunctionName: funcName,
    Runtime: 'nodejs14.x',
    Handler: 'index.handler',
    Role: 'arn:aws:iam::122194345396:role/lambda-role',
    Description: description, 
    Publish: publish,
    Layers: layerArr
  };

  const layerConfig = [];
  if(layerArr){
    
    for (let i = 0; i < layerArr.length; i++){
      const layerName = layerArr[i].layerName;
      const layerVersion = layerArr[i].layerVersion;
      layerConfig.push(`arn:aws:lambda:us-east-1:122194345396:layer:${layerName}:${layerVersion}`);
    }
    if(layerConfig.length > 0) params.Layers = layerConfig;
  }

  //sends a command via lambdaClient to create a function

  await lambdaClient.send(new CreateFunctionCommand(params))
    .then(data => {
      console.log('  Finished creating the function in Lambda.\n');   
      return data;
    })
    .catch(err => {
      console.log(error('\n  Error in lambda CreateFunctionCommand: ', err.message));
      return err;
    });

};

// FuncName: updateFunction
// Description: this will update the function FunctionName based on the file given in the S3 bucket
// input:
// funcName - the name of the function, user input 
// outputZip - the file name of the zip file
//

lambda.updateFunction = async (outputZip, funcName, options) => {
  // destructure options
  const {bucket = AwsBucket, publish = false } = options;

  console.log('    using lambdaController.updateFunction'); 
  console.log('funcName', funcName); 
  // params for lambda command
  const params = {
    FunctionName: funcName, 
    Publish: publish, 
    S3Bucket: bucket, 
    S3Key: path.basename(outputZip)
  };
  
  // send the update function command

  await lambdaClient.send(new UpdateFunctionCodeCommand(params))

    .then(data => {
      // console.log(data);
      return data;
    })
    .catch(err => {
      console.log('Error in lambda updateFunctionCode:', err); 
      return err;
    });
};

// FuncName: deleteFunction
// Description: this will delete the function FunctionName
// input:
// funcName - the name of the function, user input 
//
lambda.deleteFunction = async (funcName, qualifier) => {
  console.log('    using lambdaController.deleteFunction');
  console.log('Func name is ',funcName);

  // parameters for lambda command
  //qualifier: optional version to delete
  const params = { 
    FunctionName: funcName,
  };
  
  if(qualifier) params.Qualifier = qualifier;
  
  await lambdaClient.send(new DeleteFunctionCommand(params))
    .then(data => {
      // console.log(data);   
      return data;
    })
    .catch(err => {
      console.log('Error in lambda DeleteFunctionCommand: ', err);
      return err;
    });
};

//TODO: HARDCODED S3 BUCKET FIX 
lambda.createLambdaLayer = async (outputZip, layerName) => {
  console.log(' using lambdaController.addLambdaLayers'); 

  const params = { 
    Content: {S3Bucket: 'testbucketny30', S3Key: outputZip},
    LayerName: layerName
  };
  console.log('lambda layers func output zip', outputZip, 'layerName', layerName);
  await lambdaClient.send(new PublishLayerVersionCommand(params))
    .then(data => {
      return data;
    })
    .catch(err => {
      console.log('Error in lambda PublishLayerVersionCommand: ', err); 
    }); 
};

export default lambda;