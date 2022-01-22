import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand } from '@aws-sdk/client-iam';
import { AwsParams, AwsRole, BasicPolicy, LambdaBasicARN } from './util/aws.js';

import { starting, code, error, finished } from './util/chalkColors.js';

// create the lambda client
const iamClient = new IAMClient(AwsParams);

const iam = {};

// FuncName: createRole
// Description: ASYNC. This will create a role in aws for the user to invoke lambda functions
// input:
// roleName - a string containing the role name
//
iam.createRole = async (roleName = AwsRole) => {
  console.log(starting(`Creating a new AWS Role named ${roleName}`));
  
  // creating the params for an aws role with no policies attached
  const roleParams = {
    AssumeRolePolicyDocument: JSON.stringify(BasicPolicy),
    RoleName: roleName
  };
  console.log(AwsParams);
  console.log(roleParams);

  await iamClient.send(new CreateRoleCommand(roleParams))
    .then(data => {
      // console.log(data);
      console.log('  Created a new role.');
    })
    .catch(err => {
      console.log(error(`Error while creating a new AWS role: ${err.message}`));
      return;
    });


  // create the params to add the lambda basic execution role for global functions
  const arnParams = {
    RoleName: roleName,
    // default policy for lambda functions
    PolicyArn: LambdaBasicARN
  };
  await iamClient.send(new AttachRolePolicyCommand(arnParams))
    .then(data => {
      // console.log(data)
      console.log('  Applied the basic Lambda policy to new role');
      console.log(finished('  Finished creating new AWS role with attached basic Lambda functionality policy'));
      return;
    })
    .catch(err => {
      console.log(error(`Error while assigning policy to the new AWS role: ${err.message}`));
      return;
    });

};

export default iam;