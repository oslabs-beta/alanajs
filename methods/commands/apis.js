import api, {default as awsApi } from '../AWS/gatewayv2.js';
import {default as getApi } from '../AWS/getGatewayv2.js';
import {default as deleteApi } from '../AWS/deleteGatewayv2.js';

import lambda from '../AWS/lambda.js';
import { AwsRegion, AwsAccount } from '../util/aws.js';

//NEED TO ADD THIS TO THE REST OF THE PRODUCT

import { starting, code, error, finished } from '../util/chalkColors.js';

const methods = ['ANY', 'GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'OPTIONS'];

const verifyMethod = (method) => {
  method = method.toUpperCase();
  if (!methods.includes(method)) {
    console.log(error('The request method specified is an invalid HTTP request. The only valid requests are: '));
    console.log('  ', code(methods));
    return false;
  }
  return method;
};

const getApiId = async (apiName) => {
  const getApisResponse = await getApi.getApis();

  // get the API ID from the name
  for (const item of getApisResponse.Items) {
    if (item.Name === apiName) {
      return item.ApiId;
    }
  }
  console.log(error('No matching API name.'));
  return false;
};
const apis = {};

apis.routes = async(apiName, options) => {
  if (!options) await apis.getRoutes(apiName);
  
};

apis.createApi = async (apiName, options) => {
  const params = {
    Name: apiName
  };
  
  // add on optional params
  if (options.description) params.description = options.description;

  return await awsApi.createApi(params);
};

apis.api = async (apiName, options) => {
  if (!apiName) {
    const apis = await getApi.getApis();
    for (const item of apis.Items) {
      console.log('Name:', item.Name);
      if (item.Version) console.log('Version:', item.Version);
      console.log('Created Date:', item.CreatedDate);
      console.log('Description:', item.Description);
      console.log('API Endpoint:', item.ApiEndpoint);
      console.log('\n');
    }
    return;
  }

  const params = {
    Name: apiName,
  };
  if (options.description) params.Description = options.description;
  if (options.version) params.Version = options.version;

  if (options.create) {
    await apis.createApi(apiName, params);
    return;
  }
  const ApiId = await getApiId(apiName);
  if (!ApiId) return;
  params.ApiId = ApiId;
  
  if (options.update) {
    await api.updateApi(params);
    return;
  }
  if (options.delete) {
    api.deleteApi(params);
    return;
  }
  else {
    const apiInformation = await getApi.getApi(params);
    console.log(apiInformation);
  }
};
apis.create = async (apiName, method, route, funcName, options) => {
  // verify that method type is accurate
  method = verifyMethod(method);
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

  // create the API
  const createApiResponse = await apis.createApi(apiName, options);
  
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

  // add a deployment
  const createDeploymentResponse = await awsApi.createDeployment(params);
  if (!createDeploymentResponse) return;
  else {
    params.DeploymentId = createDeploymentResponse.DeploymentId;
  }

  // create a stage
  const createStageResponse = await awsApi.createStage(params);
  if (!createStageResponse) return;
  else {
    outputParams.StageName = createStageResponse.StageName;
  }

  // 
  route ? console.log(`A ${method} request to ${route}" has been created. See \n`) : console.log(`A ${method} request to root has been created. See \n`);
  console.log(code(`      ${outputParams.ApiEndpoint}/${outputParams.StageName}/${route}\n`));
};


apis.getRoutes = async (apiName) => {
  const output = [];
  const params = {};
  
  params.ApiId = await getApiId(apiName);
  if (!params.ApiId) return;

  // get all the routes
  const getRoutesResponse = await getApi.getRoutes(params);

  console.log(getRoutesResponse);
  // iterate over the routes
  for (const item of getRoutesResponse.Items) {
    // get the itegration IDs
    const integrationParams = {
      ApiId: params.ApiId,
      IntegrationId: item.Target.slice(13)
    };
        
    // get the information from the integration
    const getIntegrationResponse = await getApi.getIntegration(integrationParams);
        
    // parse out the info to respond into an array for a console table
    const apiRoute = {};
    const routeBreak = item.RouteKey.indexOf('/');
    apiRoute.Method = item.RouteKey.slice(0, routeBreak - 1);
    apiRoute.Route = item.RouteKey.slice(routeBreak + 1);
    const integrationUri = getIntegrationResponse.IntegrationUri;
    const functinBreak = integrationUri.indexOf('function:') + 9;
    apiRoute.FunctionName = integrationUri.slice(functinBreak);

    output.push(apiRoute);
  }
  // output the routes 
  console.table(output);
};


apis.test = async (apiName, method, route, funcName, options) => {
  // verify that method type is accurate
  method = verifyMethod(method);
  if (!method) return;

  // get api id
  const apiId = await getApiId(apiName);
  if (!apiId) return;
  
  const params = {
    ApiId: apiId
  };

  // get methods and then the specific integration
  const routeKey = method.toUpperCase() + ' /' + route;
  console.log(routeKey);
  const routes = await getApi.getRoutes(params);
  
  for (const item of routes.Items) {
    console.log(item);
    if (item.RouteKey === routeKey) {
      params.IntegrationId = item.Target.slice(13);
      break;
    }
  }

  // get the information from the integration
  const integration = await getApi.getIntegration(params);
  const functinBreak = integration.IntegrationUri.indexOf('function:') + 9;
  const functionName = integration.IntegrationUri.slice(functinBreak); 

  // remove the permissions from the function

  //add the permission to the new function

  // update the integration with the new function

  return;
};

export default apis;