import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand, GetRoleCommand, ListRolesCommand, DeleteRoleCommand } from '@aws-sdk/client-iam';
import { AwsParams, AwsRole, BasicPolicy, LambdaBasicARN } from './util/aws.js';

import { starting, code, error, finished } from './util/chalkColors.js';

// create the lambda client
const iamClient = new IAMClient(AwsParams);

const iam = {};

iam.getRoleList = async () => {
  console.log(starting('Getting a list of the AWS roles'));

  const data = await iamClient.send(new ListRolesCommand({}))
    .catch(err => {
      console.log(error(`Error while getting AWS roles: ${err.message}`));
      return;
    });

  return data.Roles;
};

// FuncName: verifyRole
// Description: ASYNC. This will check to see if a role in aws exists
// input:
// roleName - a string containing the role name
//
// output:
// boolean if the role exists
//
iam.verifyRole = async (roleName = AwsRole) => {
  console.log(starting(`Verifying the AWS Role named ${roleName}`));

  const data = await iamClient.send(new ListRolesCommand({}))
    .catch(err => {
      console.log(error(`Error while verifying AWS role: ${err.message}`));
      return;
    });
  // iterate through array and check Name against bucket
  for (const el of data.Roles) {
    if (el.RoleName === roleName) return true;
  } 
  return false;
};

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

iam.deleteARN = async (role) => {
  const params = {
    RoleName: role
  };

  const data = await iamClient.send(new DeleteRoleCommand(params))
    .catch(err => {
      console.log(error(`Error while deleting AWS role : ${err.message}`));
      return;
    });
  return data;
}

export default iam;