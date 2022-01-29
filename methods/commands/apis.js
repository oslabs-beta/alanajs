import {default as awsApi } from '../AWS/gatewayv2.js';
import lambda from '../AWS/lambda.js';
import { AwsRegion, AwsAccount } from '../util/aws.js';

//NEED TO ADD THIS TO THE REST OF THE PRODUCT

import { starting, code, error, finished } from '../util/chalkColors.js';

const methods = ['ANY', 'GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'OPTIONS'];

const verifyMethods = (method) => {
  method = method.toUpperCase();
  if (!methods.includes(method)) {
    console.log(error('The request method specified is an invalid HTTP request. The only valid requests are: '));
    console.log('  ', code(methods));
    return false;
  }
  return method;
};

const apis = async (apiName, method, route, funcName, options) => {
  // verify that method type is accurate
  method = verifyMethods(method);
  if (!method) return;

  // verify route. Set route to main route if it's '.'
  if (route === '*') {
    console.log(error('Invalid route'));
    return;
  }
  if (route === '.') route = '';

  const outputParams = {};

  const params = {
    Name: apiName,
    funcName: funcName
  };

  // add on optional params
  if (options.description) params.description = options.description;

  // create the API
  const createApiResponse = await awsApi.createApi(params);

  if (!createApiResponse) return;
  else {
    // store stuff for output
    outputParams.ApiEndpoint = createApiResponse.ApiEndpoint;

    // store stuff for usage
    params.ApiId = createApiResponse.ApiId;
  }

  // create the integration
  const createIntegrationResponse = await awsApi.createIntegration(params);
  if (!createIntegrationResponse) return;
  else {
    // add integration ID to params
    params.IntegrationId = createIntegrationResponse.IntegrationId;
    params.Target = 'integrations/' + createIntegrationResponse.IntegrationId;
  }
  // create the method
  const createRouteResponse = await awsApi.createRoute(method, route, params);
  if (!createRouteResponse) return;

  // adds the permission
  const addPermissionResponse = await lambda.addPermission(funcName, params.ApiId, method, route);
  if (!addPermissionResponse) return;

  const createDeploymentResponse = await awsApi.createDeployment(params);
  if (!createDeploymentResponse) return;
  else {
    params.DeploymentId = createDeploymentResponse.DeploymentId;
  }

  const createStageResponse = await awsApi.createStage(params);
  if (!createStageResponse) return;
  else {
    outputParams.StageName = createStageResponse.StageName;
  }

  route? console.log(`A ${method} request to ${route}" has been created. See \n`) : console.log(`A ${method} request to root has been created. See \n`);
  console.log(code(`      ${outputParams.ApiEndpoint}/${outputParams.StageName}/${route}\n`));
};

export default apis;