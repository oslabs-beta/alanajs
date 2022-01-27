import lambda from '../AWS/lambda.js';

import { intro, starting, error, fail, finished, code } from '../util/chalkColors.js';

const aliases = async (funcName, version, options) => {
  if (options.create){
    const aliasName = options.create;
    console.log(starting('Sending request to AWS Lambda...'));
    const response = await lambda.createAlias(funcName, version, aliasName); 
    if (response.$metadata.httpStatusCode < 300) console.log(finished('Request complete: Alias created')); 
  }

  else if (options.update){
    const aliasName = options.update;
    console.log(starting('Sending request to AWS Lambda...'));
    const response = await lambda.updateAlias(funcName, version, aliasName); 
    if (response.$metadata.httpStatusCode < 300) console.log(finished('Request complete: Alias updated')); 
  }

  else if (options.delete){
    const aliasName = options.delete;
    console.log(starting('Sending request to AWS Lambda...'));
    const response = await lambda.deleteAlias(funcName, aliasName); 
    if (response.$metadata.httpStatusCode < 300) console.log(finished('Request complete: Alias deleted'));
  }
};


export default aliases;