import express from 'express';

// import zip from '../controllers/util/zipUtility.js';
import lambdaController from '../controllers/lambdaController.js';
import s3Controller from '../controllers/s3Controller.js';
import cloudWatchController from '../controllers/cloudWatchController.js';
import iamController from '../controllers/iamController.js';
import zipController from '../controllers/zipController.js';

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

//create lambda function 
router.get('/createFunction', zipController.zip, s3Controller.sendFile, lambdaController.createFunction, (req, res) => {
  res.status(200).json('Lambda function created'); 
}); 

//update lambda function 
router.get('/updateFunction', zipController.zip, s3Controller.sendFile, lambdaController.updateFunction, (req, res) => {
  res.status(200).json('Lambda function updated ');
}); 

//delete lambda function 
router.get('/deleteFunction', lambdaController.deleteFunction, (req, res) => {
  res.status(200).json('Lambda function deleted ');
}); 

// sends the file to S3 bucket. Not finished. Need to adjust parameters to accept different bucket name and file name
router.get('/createBucket', s3Controller.createBucket, (req, res) => {
  res.status(200).json(res.locals.data);
});

// creates an ARN. Not finished. need to adjust parameters to accept different role name
router.get('/createARN', iamController.createRole, (req, res) => {
  res.status(200).json('done');
});

// completely not working yet
router.get('/getMetrics', cloudWatchController.getMetrics, (req, res) => {
  res.status(200).json('This is not a functioning route yet');
  
});

router.get('/createLayer', zipController.zip, s3Controller.sendFile, lambdaController.addLambdaLayers, (req, res) => {
  res.status(200).json('Lambda layer created'); 
}); 

// router.get('/createAlias', lambdaController.updateFunction ,lambdaController.createAlias ,(req,res) => {
//   res.status(200).json('Alias created');
// });


export default router;