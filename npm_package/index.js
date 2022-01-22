import lambdaController from '../server/controllers/lambdaController.js';
import s3Controller from '../server/controllers/s3Controller.js';
import zipController from '../server/controllers/zipController.js';

const alana = {}; 

alana.getFuncList = () => {
  console.log('alana.getFuncList invoked'); 
  const functionList = lambdaController.getFuncList2();
  console.log('Finished getting Lambda function list');
};

alana.createFunction = async (params) => {
  const {fileArr, funcName} = params; 
  console.log('alana.createFunc invoked'); 
  
  const zipFile = await zipController.zip2(fileArr); 
  console.log('zipfile after zipcontroller', zipFile);
  await s3Controller.sendFile2(zipFile); 
  await lambdaController.createFunction2(zipFile, funcName); 
  console.log('Lambda function has been created');
};

alana.updateFunction = async (params) => {
  const {fileArr, funcName} = params; 
  console.log('alana.updateFunction invoked');
  const zipFile = await zipController.zip2(fileArr); 
  await s3Controller.sendFile2(zipFile); 
  await lambdaController.updateFunction2(zipFile, funcName);
  console.log('Lambda function has been updated');
};

alana.deleteFunction = async (funcName) => {
  console.log('alana.deleteFunction invoked'); 
  await lambdaController.deleteFunction2(funcName);
  console.log('Lambda function has been deleted'); 
}; 


export default alana;