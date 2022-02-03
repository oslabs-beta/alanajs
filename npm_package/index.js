import lambda from '../methods/AWS/lambda.js';
import s3 from '../methods/AWS/s3.js';
import zip from '../methods/util/zip.js';
import archiveZip from '../methods/util/archiver.js';
import lambdaFunctions from '../methods/commands/functions.js';
import layers from '../methods/commands/layers.js';
import API from '../methods/AWS/gatewayv2';
const alana = {}; 

/**
 * @FunctionName: getFuncList
 * @Description: Displays table of lambda functions 
 */
alana.getFuncList = async () => {
  console.log('alana.getFuncList invoked'); 
  const functionList = await lambda.getFuncList();
  console.log('Finished getting Lambda function list');
  return functionList;
};

/**
 * @FunctionName: getFuncVersions
 * @Description: Displays table of function versions 
 * @input: string that contains function name
 */
alana.getFuncVersions = async (funcName) => {
  console.log('alana.getFuncVersions invoked'); 
  const versionList = await lambda.getFuncVersionList(funcName);
  console.table(versionList);
  console.log('Finished getting Lambda function versions');
  return versionList;
};

/**
 * @FunctionName: createFunction
 * @Description: creates AWS Lambda function 
 * @input: params object which includes array of file names and name of function :options object 
 */
alana.createFunction = async (params, options = {}) => {
  const {fileArr, funcName} = params; 
  console.log('alana.createFunction invoked'); 
  await lambdaFunctions.create(params.funcName, params.fileArr, options);
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
  const zipFile = await archiveZip.zipFiles(fileArr); 
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
  await layers.create(layerName, fileArr);
}; 

/**
 * @FunctionName: createAlias
 * @Description: creates Alias for Lambda functions 
 * @input: params object which includes function name and version 
 */
alana.createAlias = async (params, aliasName) => {
  const {funcName, version} = params; 
  console.log('alana.createAlias invoked');
  await lambda.createAlias(funcName, version, aliasName);
  console.log('Lambda Alias function has been created');
};

/**
 * @FunctionName: updateAlias 
 * @Description: updates Alias for Lambda functions 
 * @input: params object which includes function name and version 
 */
alana.updateAlias = async (params, aliasName) => {
  const {funcName, version} = params; 
  console.log('alana.createAlias invoked');
  await lambda.updateAlias(funcName, version, aliasName);
  console.log('Lambda Alias function has been updated');
};

/**
 * @FunctionName: deleteAlias
 * @Description: deletes Alias for Lambda functions 
 * @input: params object which includes function name 
 */
alana.deleteAlias = async (params, aliasName) => {
  const {funcName} = params; 
  console.log('alana.createAlias invoked');
  await lambda.deleteAlias(funcName, aliasName);
  console.log('Lambda Alias function has been deleted');
};

/**
 * @FunctionName: invoke 
 * @Description: invokes Lambda function 
 * @input: funcName - string that includes name of function : params - object 
 * @output: result of invoked function 
 */
alana.invoke = async (funcName, params) => {
  console.log('alana.invoke invoked');
  await lambda.invoke(funcName);
  console.log('Lambda function has been invoked');
};

/**
 * @FunctionName: addLayerToFunc
 * @Description: adds Lambda layer to Lambda function 
 * @input: funcName - string that includes name of function: layerArr - array of objects which include name of files and name of layer 
 */
alana.addLayerToFunction = async (funcName, layer) => {
  console.log('alana.addLayerToFunc invoked'); 
  await layers.addLayersToFunc(funcName, layer)
  // await lambda.addLayerToFunc(funcName, layerArr); 
  console.log('Lambda layer added to function'); 
};

alana.getGatewayRestInfo = async() => {
  console.log('alana.getGatewayRestInfo'); 
  await API.getGatewayInfo(); 

};


export default alana;