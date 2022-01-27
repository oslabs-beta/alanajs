import lambda from '../methods/AWS/lambda.js';
import s3 from '../methods/AWS/s3.js';

import archiver from '../methods/util/archiver.js';

import { intro, starting, error, fail, finished, code } from '../methods/util/chalkColors.js';

const layers = {};

layers.create = async (layerName, fileArr) => {
      
  if(!fileArr || !layerName){
    console.log(error('both fileArr and layerName are required fields')); 
    return; 
  }
  const outputZip = `${fileArr}.zip`;
  console.log(starting('Compressing layer files...')); 
  await archiver.zipFiles(fileArr);
    
  console.log(starting('Sending files to S3...'));
  await s3.sendFile(outputZip);
    
  console.log(starting('Sending files to AWS Lambda...'));
  await lambda.createLambdaLayer(layerName, outputZip); 
    
  console.log(finished('Request complete: Lambda layers created'));
};

layers.addLayersToFunc = async(funcName, options) => {

  const layerArr = [{layerName: options.layerName, layerVersion: options.layerVersion}]; 
    
  if(!funcName || !layerArr){
    console.log(error('funcName, layerName, and layerVersion are required fields')); 
    return; 
  }
  console.log(starting('Sending request to AWS Lambda...')); 
  await lambda.addLayerToFunc(funcName, layerArr); 
  console.log(finished('Request complete: Lambda layers added to function'));

};

export default layers;