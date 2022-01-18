import express from 'express';

import { LambdaClient, ListFunctionsCommand, CreateFunctionCommand, InvokeCommand } from '@aws-sdk/client-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';

import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

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

// create the s3 client
const s3Client = new S3Client({
  'region': region,
  'credentials': credentials,
})

// create the cwClient
const cwClient = new CloudWatchClient({
  'region': region,
  'credentials': credentials,
});

const lambdaFunc = `exports.handler = async (event) => {
  // TODO implement

  let temp = event.num+3;
  const response = {
      statusCode: 200,
      body: JSON.stringify(temp),
  };
  return response;
};`;

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
    //needed function name
    FunctionName: 'add2',
    //role
    // Role: ' arn:aws:iam::122194345396:role/service-role/testGetLogs-role-zp4j3336 ', 

    // alt function call
    // FunctionName: 'test2',
    // Role: 'arn:aws:lambda:us-east-1:122194345396:function:test2',

    // pass in arguments for the lambda function (input payload)
    // Payload: {keyword: 'hello'},

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
      // next();
      console.log(res.locals.lambdaResponse);
      res.status(res.locals.lambdaResponse.statusCode).json(res.locals.lambdaResponse.body);
    })
    .catch(err => {
      console.log('Error in lambda function invokation: ', err);
      return next(err);
    });
});

// creates a zip file from the lambda func
router.get('/zipFile', (req, res, next) => {
  console.log('      awsRouter.create zip file');

  // //create an Output.txt file with the testFunc as a string
  // fs.writeFile('Output.txt', testFunc.toString(), (err) => {   
  //   // In case of a error throw err.
  //   if (err) throw err;
  //   console.log('creating Output.txt');
  // });

  // create the zip instance
  const zip = new JSZip();

  // creates a file index.js with the string of lambdaFunc in it
  zip.file('index.js', lambdaFunc);
  console.log(zip);

  // create the output file out.zip
  let temp = zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream('out.zip'))
    .on('finish', () => console.log('    out.zip written.'));
  
  res.status(200).json('done');
});

router.get('/sendS3', (req, res, next) => {
  console.log('    Sending created file to S3')

  const fileStream = fs.createReadStream('Out.zip');
  // console.log(fileStream);
  
  const uploadParams = {
    Bucket: "testbucketny30",
    // Add the required 'Key' parameter using the 'path' module.
    Key: path.basename('Out.zip'),
    // Add the required 'Body' parameter
    Body: fileStream,
  };

  s3Client.send(new PutObjectCommand(uploadParams))
    .then(data => console.log(data));

  res.status(200).json('done');
})

router.get('/sendLambdaFunc', (res, req, next) => {
  //parameters for lambda command
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
    })
    .catch(err => {
      console.log('Error in lambda CreateFunctionCommand: ', err);
      return next(err);
    });

  res.status(200).json('done');
})

router.get('/getMetrics', async (req, res, next) => {
  //initialize the variables for creating the inputs for AWS request
  let graphPeriod, graphUnits, graphMetricName, graphMetricStat;

  graphMetricName = req.params.metricName;

  if (req.body.timePeriod === '30min') {
    [graphPeriod, graphUnits] = [30, 'minutes'];
  } else if (req.body.timePeriod === '1hr') {
    [graphPeriod, graphUnits] = [60, 'minutes'];
  } else if (req.body.timePeriod === '24hr') {
    [graphPeriod, graphUnits] = [24, 'hours'];
  } else if (req.body.timePeriod === '7d') {
    [graphPeriod, graphUnits] = [7, 'days'];
  } else if (req.body.timePeriod === '14d') {
    [graphPeriod, graphUnits] = [14, 'days'];
  } else if (req.body.timePeriod === '30d') {
    [graphPeriod, graphUnits] = [30, 'days'];
  }

  if (!req.body.metricStat) graphMetricStat = 'Sum';
  else graphMetricStat = req.body.metricStat;

  //Metrics for All Functions (combined)
  //Prepare the input parameters for the AWS getMetricsData API Query
  const metricAllFuncInputParams = AWSUtilFunc.prepCwMetricQueryLambdaAllFunc(
    graphPeriod,
    graphUnits,
    graphMetricName,
    graphMetricStat
  );

  try {
    const metricAllFuncResult = await cwClient.send(
      new GetMetricDataCommand(metricAllFuncInputParams)
    )}
    catch(error) {
      console.log(error);
    }
});


export default router;