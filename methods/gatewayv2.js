
import { ApiGatewayV2Client, CreateApiCommand, CreateRouteCommand, CreateIntegrationCommand, CreateStageCommand, CreateDeploymentCommand } from '@aws-sdk/client-apigatewayv2';
import { AwsParams } from './util/aws.js';


const apiGateway = new ApiGatewayV2Client(AwsParams);

const HTTPApi = {};

HTTPApi.createApi = async (params) => {
  const awsParams = {
    Name: params.name,
    ProtocolType: 'HTTP',
    Description: params.description,
  };
  const data = await apiGateway.send(new CreateApiCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));

  return data;
};

HTTPApi.createRoute = async (params) => {
  const awsParams = {
    ApiId: params.apiId,
    RouteKey: params.routeKey,
    Target: params.target
  };
  const data = await apiGateway.send(new CreateRouteCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
  
  return data;
};

HTTPApi.createIntegration = async (params) => {
  const awsParams = {
    ApiId: params.apiId,
    IntegrationMethod: 'POST',
    IntegrationUri: params.integrationUri,
    ConnectionType: 'INTERNET',
    IntegrationType: 'AWS_PROXY',
    PayloadFormatVersion: '2.0'

  };
  const data = await apiGateway.send(new CreateIntegrationCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
    
  return data;
};

HTTPApi.createDeployment = async (params) => {
  const awsParams = {
    ApiId: params.apiId,
  };

  const data = await apiGateway.send(new CreateDeploymentCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
    
  return data;
};

HTTPApi.createStage = async (params) => {
  const awsParams = {
    ApiId: params.apiId,
    StageName: '1',
    DeploymentId: params.deploymentId,
    AutoDeployed: true
  };

  const data = await apiGateway.send(new CreateStageCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
    
  return data;
};

export default HTTPApi;