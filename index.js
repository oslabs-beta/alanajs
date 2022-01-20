import { LambdaClient, ListFunctionsCommand, CreateFunctionCommand, InvokeCommand, UpdateFunctionCodeCommand, DeleteFunctionCommand } from '@aws-sdk/client-lambda';
import path from 'path';
import awsParams from './server/controllers/util/awsCredentials.js';

// create the lambda client
const lambdaClient = new LambdaClient(awsParams);

const getFuncList = (req, res, next) => {
  console.log('running getFuncList');
  //parameters for lambda command
  const params = { FunctionVersion: 'ALL' };
  
  //sends a command via lambdaClient to list all functions
  console.log('before send');
  lambdaClient.send(new ListFunctionsCommand(params))
    .then(data => {
      console.log('data');
  
      //parses out the function names from the functionList
      const functionList = data.Functions.map((el) => el.FunctionName);
      console.log(functionList);
      return functionList;
    })
    .catch(err => {
      console.log('Error in getFuncList: ', err);
      return err;
    });
};

export default getFuncList;