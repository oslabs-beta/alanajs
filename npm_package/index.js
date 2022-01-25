import lambda from '../methods/lambda.js';
import s3 from '../methods/s3.js';
import zip from '../methods/zip.js';
import archiver from '../methods/zip.js';

const alana = {}; 

/**
 * @FunctionName: getFuncList
 * @Description: Displays table of lambda functions 
 */
alana.getFuncList = () => {
  console.log('alana.getFuncList invoked'); 
  const functionList = lambda.getFuncList();
  console.table(functionList);
  console.log('Finished getting Lambda function list');
};

/**
 * @FunctionName: getFuncVersions
 * @Description: Displays table of function versions 
 * @input: string that contains function name
 */
alana.getFuncVersions = (funcName) => {
  console.log('alana.getFuncVersions invoked'); 
  const versionList = lambda.getFuncVersions(funcName);
  console.table(versionList);
  console.log('Finished getting Lambda function versions');
};

/**
 * @FunctionName: createFunction
 * @Description: creates AWS Lambda function 
 * @input: params object which includes array of file names and name of function :options object 
 */
alana.createFunction = async (params, options = {}) => {
  const {fileArr, funcName} = params; 
  console.log('alana.createFunc invoked'); 
  
  const zipFile = await zip.zipFiles(fileArr); 
  console.log('zipfile after zipcontroller', zipFile);
  await s3.sendFile(zipFile); 
  await lambda.createFunction(zipFile, funcName, options); 
  console.log('Lambda function has been created');
};

/**
 * @FunctionName: updateFunction
 * @Description: updates AWS Lambda function 
 * @input: params object which includes array of file names and name of function to be updated 
 */
alana.updateFunction = async (params) => {
  const {fileArr, funcName} = params; 
  console.log('alana.updateFunction invoked');
  const zipFile = await archiver.zipFiles(fileArr); 
  await s3.sendFile(zipFile); 
  await lambda.updateFunction(zipFile, funcName);
  console.log('Lambda function has been updated');
};

/** 
 * @FunctionName: deleteFunction
 * @Description: deletes AWS Lambda function
 * @input: string which contains function name  
*/
alana.deleteFunction = async (funcName) => {
  console.log('alana.deleteFunction invoked'); 
  await lambda.deleteFunction(funcName);
  console.log('Lambda function has been deleted'); 
}; 

/**
 * @FunctionName: createLambdaLayer
 * @Description: creates AWS Lambda layer
 * @input: params object that contains array of files and layer name, qualifier
 */
alana.createLambdaLayer = async (params, qualifier) => {
  const {fileArr, layerName} = params; 
  console.log('alana.deleteFunction invoked'); 
  const zipFile = await archiver.zipFiles(fileArr); 
  await s3.sendFile(zipFile); 
  await lambda.createLambdaLayer(zipFile, layerName); 
  console.log('Lambda layer has been created'); 
}; 

/**
 * @Function
 */
alana.createAlias = async (params) => {
  const {funcName, version} = params; 
  console.log('alana.createAlias invoked');
  await lambda.createAlias(funcName, version);
  console.log('Lambda Alias function has been created');
};

alana.updateAlias = async (params) => {
  const {funcName, version} = params; 
  console.log('alana.createAlias invoked');
  await lambda.updateAlias(funcName, version);
  console.log('Lambda Alias function has been updated');
};

alana.deleteAlias = async (params) => {
  const {funcName} = params; 
  console.log('alana.createAlias invoked');
  await lambda.deleteAlias(funcName);
  console.log('Lambda Alias function has been deleted');
};

alana.invoke = async (funcName, params) => {
  console.log('alana.invoke invoked');
  await lambda.invoke(funcName);
  console.log('Lambda function has been invoked');
};

alana.addLayerToFunc = async (funcName, layerArr) => {
  console.log('alana.addLayerToFunc invoked'); 
  await lambda.addLayerToFunc(funcName, layerArr); 
  console.log('Lambda layer added to function'); 
};
export default alana;