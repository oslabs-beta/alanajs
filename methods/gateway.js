import { APIGateway, APIGatewayClient, CreateRestApiCommand, GetRestApiCommand, CreateDeploymentCommand, GetMethodCommand, PutMethodCommand, GetResourcesCommand, PutIntegrationCommand, GetIntegrationCommand, PutIntegrationResponseCommand, GetIntegrationResponseCommand, PutMethodResponseCommand, GetMethodResponseCommand } from '@aws-sdk/client-api-gateway';
import { AwsParams } from './util/aws.js';

const apiGateway = new APIGatewayClient(AwsParams);

const API = {};

API.createGateway = async () => {
  const data = await apiGateway.send(new CreateRestApiCommand({name: 'thirdApi'}))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getGatewayInfo = async () => {
  const data = await apiGateway.send(new GetRestApiCommand({restApiId: 'razmirg6cb'}))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};
API.putMethod = async () => {

  const params = {
    authorizationType: 'none',
    httpMethod: 'GET',
    resourceId: 'cz8qpoa5sd', 
    restApiId: 'razmirg6cb'
  };

  const data = await apiGateway.send(new PutMethodCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getMethod = async () => {

  const params = {
    httpMethod: 'ANY',
    resourceId: 'cz8qpoa5sd', 
    restApiId: 'razmirg6cb'
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
  const data = await apiGateway.send(new GetResourcesCommand({restApiId: 'razmirg6cb'}))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.putIntegration = async() => {
  const params = {
    httpMethod: 'GET',
    integrationHttpMethod: 'GET',
    resourceId: 'cz8qpoa5sd', 
    restApiId: 'razmirg6cb',
    type: 'AWS',
    uri: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:122194345396:function:hello1/invocations'
  };
  const data = await apiGateway.send(new PutIntegrationCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getIntegration = async() => {
  const params = {
    httpMethod: 'ANY', 
    resourceId: 'cz8qpoa5sd', 
    restApiId: 'razmirg6cb'
  };
  const data = await apiGateway.send(new GetIntegrationCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.putIntegrationResponse = async() => {
  const params = {
    httpMethod: 'GET',
    integrationHttpMethod: 'GET',
    resourceId: 'cz8qpoa5sd', 
    restApiId: 'razmirg6cb',
    responseTemplates: {},
    statusCode: '200'
  };
  const data = await apiGateway.send(new PutIntegrationResponseCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

API.getIntegrationResponse = async() => {
  const params = {
    httpMethod: 'ANY',
    resourceId: 'fdudjs', 
    restApiId: 'razmirg6cb',
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
    resourceId: 'cz8qpoa5sd', 
    restApiId: 'razmirg6cb',
    responseModels: { 'application/json': 'Empty' },
    statusCode: '200'
  };
  const data = await apiGateway.send(new PutMethodResponseCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};
  
API.getMethodResponse = async() => {
  const params = {
    httpMethod: 'ANY',
    resourceId: 'fdudjs', 
    restApiId: 'razmirg6cb',
    statusCode: '200'
  };
  const data = await apiGateway.send(new GetMethodResponseCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

export default API;