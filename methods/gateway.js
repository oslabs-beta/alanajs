// ORDER OF OPERATIONS FOR REST API
//   API.createGateway();
//   API.putMethod();
//   lambda.addPermission('testLambda'); // there's currently a permissions issue we can't resolve. Generating through SDK or lambda console don't work but when creating through api console it does.
//   API.putIntegration();
//   API.putIntegrationResponse();
//   API.putMethodResponse();
//   API.deployGateway();
        
//   lambda.getPolicy('testLambda');
  
  
//   createGateway - need gateway resource id from the return. this is ID in gateway.js
//   create role with gateway permissions - need to copy from existing role in IAM. I've only done this in the AWS console.
//   getResources - to get default route resource id. this is resource in gateway.js
//   putMethod - to add the Method handler from the client
//   putIntegration - to add the method to integration request. This adds the lambda invocation
//   putIntegrationResponse - to add the aws integration response from the lambda function
//   putMethodResponse - connects the integration response to the http method response
//   addPermission - adds the permission to the lambda function so it can be invoked by the api
//   deployGateway - not 100% sure but this updates everything in gateway so it can be called from the internet




import { APIGateway, APIGatewayClient, CreateRestApiCommand, GetRestApiCommand, CreateDeploymentCommand, GetMethodCommand, PutMethodCommand, GetResourcesCommand, PutIntegrationCommand, GetIntegrationCommand, PutIntegrationResponseCommand, GetIntegrationResponseCommand, PutMethodResponseCommand, GetMethodResponseCommand } from '@aws-sdk/client-api-gateway';
import { AwsParams } from './util/aws.js';

const id = 'rq92lpnomi';
const resource = 'nne3795590';

const apiGateway = new APIGatewayClient(AwsParams);

const API = {};

API.createGateway = async () => {
  const data = await apiGateway.send(new CreateRestApiCommand({name: 'thirdApi'}))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getGatewayInfo = async () => {
  const data = await apiGateway.send(new GetRestApiCommand({restApiId: id}))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.putMethod = async () => {

  const params = {
    authorizationType: 'none',
    httpMethod: 'GET',
    resourceId: resource, 
    restApiId: id
  };

  const data = await apiGateway.send(new PutMethodCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getMethod = async () => {

  const params = {
    httpMethod: 'GET',
    resourceId: resource, 
    restApiId: id
  };
  
  const data = await apiGateway.send(new GetMethodCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};
  
API.deployGateway = async () => {
  const data = await apiGateway.send(new CreateDeploymentCommand({restApiId: 'razmirg6cb'}))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getResources = async () => {
  const data = await apiGateway.send(new GetResourcesCommand({restApiId: id}))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.putIntegration = async() => {
  const params = {
    httpMethod: 'GET',
    integrationHttpMethod: 'GET',
    resourceId: resource, 
    restApiId: id,
    type: 'AWS',
    uri: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:122194345396:function:testLambda/invocations'
  };
  const data = await apiGateway.send(new PutIntegrationCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getIntegration = async() => {
  const params = {
    httpMethod: 'GET', 
    resourceId: resource, 
    restApiId: id
  };
  const data = await apiGateway.send(new GetIntegrationCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.putIntegrationResponse = async() => {
  const params = {
    httpMethod: 'GET',
    integrationHttpMethod: 'GET',
    resourceId: resource, 
    restApiId: id,
    responseTemplates: {},
    statusCode: '200'
  };
  const data = await apiGateway.send(new PutIntegrationResponseCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getIntegrationResponse = async() => {
  const params = {
    httpMethod: 'GET',
    resourceId: resource, 
    restApiId: id,
    statusCode: '200'
  };
  const data = await apiGateway.send(new GetIntegrationResponseCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.putMethodResponse = async() => {
  const params = {
    httpMethod: 'GET',
    integrationHttpMethod: 'GET',
    resourceId: resource, 
    restApiId: id,
    responseModels: { 'application/json': 'Empty' },
    statusCode: '200'
  };
  const data = await apiGateway.send(new PutMethodResponseCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};
  
API.getMethodResponse = async() => {
  const params = {
    httpMethod: 'GET',
    resourceId: resource, 
    restApiId: id,
    statusCode: '200'
  };
  const data = await apiGateway.send(new GetMethodResponseCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

export default API;