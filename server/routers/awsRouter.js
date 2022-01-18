import express from 'express';

import zip from '../controllers/util/zipUtility.js';
import lambdaController from '../controllers/lambdaController.js';
import s3Controller from '../controllers/s3Controller.js';
import cloudWatchController from '../controllers/cloudWatchController.js';
import iamController from '../controllers/iamController.js';

// set up express router
const router = express.Router();

// initial route 
router.use('/', (req, res, next) => {
  console.log('  using awsRouter with pathname', req.url);
  next();
});

// get a list of all lambda functions
router.get('/funcList', lambdaController.getFuncList, (req, res) => {
  res.status(200).json(res.locals.functionList);
});

// invokes the command
router.get('/command', lambdaController.invoke, (req, res) => {
  res.status(res.locals.lambdaResponse.statusCode).json(res.locals.lambdaResponse.body);
});

// creates a zip file from the lambda func
router.get('/zipFile', (req, res) => {
  console.log('      awsRouter.create zip file');
  // zip the file names given as strings. the first file is always turned to index
  res.locals.zipFileName = zip(['test.js']); 
  res.status(200).json(res.locals.zipFileName);
});

// sends the file to S3 bucket. Not finished. Need to adjust parameters to accept different bucket name and file name
router.get('/sendS3', s3Controller.sendFile, (req, res) => {
  res.status(200).json('done');
});

// sends the file to S3 bucket. Not finished. Need to adjust parameters to accept different bucket name and file name
router.get('/createBucket', s3Controller.createBucket, (req, res) => {
  res.status(200).json(res.locals.data);
});

// sends the file from s3 to lambda. Not finished. need to adjust parameters to accept diff bucket name, file name, function name
router.get('/sendLambdaFunc', lambdaController.createFunction, (res, req) => {
  res.status(200).json('done');
});

// creates an ARN. Not finished. need to adjust parameters to accept different role name
router.get('/createARN', iamController.createRole, (req, res) => {
  res.status(200).json('done');
});
// completely not working yet
router.get('/getMetrics', cloudWatchController.getMetrics, (req, res) => {
  res.status(200).json('This is not a functioning route yet');
  
});


export default router;