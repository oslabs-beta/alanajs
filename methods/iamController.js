import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand } from '@aws-sdk/client-iam';

import awsParams from './util/awsCredentials.js';

// create the lambda client
const iamClient = new IAMClient(awsParams);

const iamController = {};

// FuncName: createRole
// Description: ASYNC. This will create a role in aws for the user to invoke lambda functions
// input:
// need a role name
//
iamController.createRole = async (req, res, next) => {
  console.log('      using iamController.createRole');

  // the basic policy needed from AWS in order to create a role for lambda
  const basicPolicy = {
    'Version': '2012-10-17',
    'Statement': [
      {
        'Effect': 'Allow',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
        'Action': 'sts:AssumeRole',
      }
    ]
  };
  
  // creating the params for an aws role with no policies attached
  const roleParams = {
    AssumeRolePolicyDocument: JSON.stringify(basicPolicy),
    RoleName: 'test4-lambda-role'
  };
  await iamClient.send(new CreateRoleCommand(roleParams))
    .then(data => console.log(data));


  // create the params to add the lambda basic execution role for global functions
  const arnParams = {
    RoleName: 'test4-lambda-role',
    // default policy for lambda functions
    PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
  };
  await iamClient.send(new AttachRolePolicyCommand(arnParams))
    .then(data => console.log(data));

  next();
};
export default iamController;