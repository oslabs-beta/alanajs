import lambda from '../methods/lambda.js';
import s3 from '../methods/s3.js';
import zip from '../methods/zip.js';

const alana = {}; 

alana.getFuncList = () => {
  console.log('alana.getFuncList invoked'); 
  const functionList = lambda.getFuncList();
  console.log('Finished getting Lambda function list');
};

alana.createFunction = async (params) => {
  const {fileArr, funcName} = params; 
  console.log('alana.createFunc invoked'); 
  
  const zipFile = await zip.zipFiles(fileArr); 
  console.log('zipfile after zipcontroller', zipFile);
  await s3.sendFile(zipFile); 
  await lambda.createFunction(zipFile, funcName); 
  console.log('Lambda function has been created');
};

alana.updateFunction = async (params) => {
  const {fileArr, funcName} = params; 
  console.log('alana.updateFunction invoked');
  const zipFile = await zip.zipFiles(fileArr); 
  await s3.sendFile(zipFile); 
  await lambda.updateFunction(zipFile, funcName);
  console.log('Lambda function has been updated');
};

alana.deleteFunction = async (funcName) => {
  console.log('alana.deleteFunction invoked'); 
  await lambda.deleteFunction(funcName);
  console.log('Lambda function has been deleted'); 
}; 

alana.invoke = async (funcName, params) => {
  console.log('alana.invoke invoked');
  await lambda.invoke(funcName);
  console.log('Lambda function has been invoked');
};
export default alana;