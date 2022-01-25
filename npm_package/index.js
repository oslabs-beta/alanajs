import lambda from '../methods/lambda.js';
import s3 from '../methods/s3.js';
import zip from '../methods/zip.js';
import archiver from '../methods/zip.js';

const alana = {}; 

alana.getFuncList = () => {
  console.log('alana.getFuncList invoked'); 
  const functionList = lambda.getFuncList();
  console.table(functionList);
  console.log('Finished getting Lambda function list');
};

alana.getFuncVersions = (funcName) => {
  console.log('alana.getFuncVersions invoked'); 
  const versionList = lambda.getFuncVersions(funcName);
  console.table(versionList);
  console.log('Finished getting Lambda function versions');
};

alana.createFunction = async (params, options = {}) => {
  const {fileArr, funcName} = params; 
  console.log('alana.createFunc invoked'); 
  
  const zipFile = await zip.zipFiles(fileArr); 
  console.log('zipfile after zipcontroller', zipFile);
  await s3.sendFile(zipFile); 
  await lambda.createFunction(zipFile, funcName, options); 
  console.log('Lambda function has been created');
};

alana.updateFunction = async (params) => {
  const {fileArr, funcName} = params; 
  console.log('alana.updateFunction invoked');
  const zipFile = await archiver.zipFiles(fileArr); 
  await s3.sendFile(zipFile); 
  await lambda.updateFunction(zipFile, funcName);
  console.log('Lambda function has been updated');
};

alana.deleteFunction = async (funcName) => {
  console.log('alana.deleteFunction invoked'); 
  await lambda.deleteFunction(funcName);
  console.log('Lambda function has been deleted'); 
}; 

alana.createLambdaLayer = async (params) => {
  const {fileArr, layerName} = params; 
  console.log('alana.deleteFunction invoked'); 
  const zipFile = await archiver.zipFiles(fileArr); 
  await s3.sendFile(zipFile); 
  await lambda.createLambdaLayer(zipFile, layerName); 
  console.log('Lambda layer has been created'); 
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