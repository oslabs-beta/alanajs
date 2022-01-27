import lambda from '../AWS/lambda.js';
import s3 from '../AWS/s3.js';

import archiver from '../util/archiver.js';

import { intro, starting, error, fail, finished, code } from '../util/chalkColors.js';

const layers = {};

layers.create = async (layerName, fileArr) => {
      
  // if(!fileArr && !layerName){
  //   console.log(error('both fileArr and layerName are required fields')); 
  //   return; 
  // }
  const outputZip = `${fileArr}.zip`;
  console.log(starting('Compressing layer files...')); 
  await archiver.zipFiles(fileArr);
    
  console.log(starting('Sending files to S3...'));
  await s3.sendFile(outputZip);
    
  console.log(starting('Sending files to AWS Lambda...'));
  const response = await lambda.createLambdaLayer(layerName, outputZip); 
  if (response.$metadata.httpStatusCode < 300) {
    console.log(finished('Request complete:  Lambda layers created'));
  }
  else {
    console.log(error('Error with sending request to AWS Lambda'));
  }
};

layers.addLayersToFunc = async(funcName, options) => {

  const layerArr = [{layerName: options.layerName, layerVersion: options.layerVersion}]; 
    
  if(!funcName || !layerArr){
    console.log(error('funcName, layerName, and layerVersion are required fields')); 
    return; 
  }
  console.log(starting('Sending request to AWS Lambda...')); 
  const response = await lambda.addLayerToFunc(funcName, layerArr); 
  if (response.$metadata.httpStatusCode < 300) {
    console.log(finished('Request complete:  Lambda layers added to function'));
  }
  else {
    console.log(error('Error with sending request to AWS Lambda'));
  }

};

export default layers;