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