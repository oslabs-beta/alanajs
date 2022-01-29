
import { ApiGatewayV2Client, CreateApiCommand, CreateRouteCommand, CreateIntegrationCommand, CreateStageCommand, CreateDeploymentCommand } from '@aws-sdk/client-apigatewayv2';
import { AwsAccount, AwsParams, AwsRegion } from '../util/aws.js';


const apiGateway = new ApiGatewayV2Client(AwsParams);

import { starting, error, fail, finished } from '../util/chalkColors.js';


const api = {};

api.createApi = async (params) => {
  params.Description ? console.log(starting(`Creating an API named "${params.Name}" with the description "${params.Sescription}"`)) : console.log(starting(`Creating an API named "${params.Name}"`));

  const awsParams = {
    Name: params.Name,
    ProtocolType: 'HTTP',
    Description: params.Description,
  };

  const data = await apiGateway.send(new CreateApiCommand(awsParams))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished creating API\n'));
      return data;
    })
    .catch(err => {
      console.log(error('  Error in creating API gateway: ', err.message));
      return;
    });

  return data;
};

api.createIntegration = async (params) => {
  console.log(starting(`Creating an Lambda integration of function "${params.funcName}" to the API "${params.Name}"`));

  const awsParams = {
    ApiId: params.ApiId,
    IntegrationMethod: 'POST',
    IntegrationUri: 'arn:aws:lambda:' + AwsRegion + ':' + AwsAccount + ':function:' + params.funcName,
    ConnectionType: 'INTERNET',
    IntegrationType: 'AWS_PROXY',
    PayloadFormatVersion: '2.0'

  };
  const data = await apiGateway.send(new CreateIntegrationCommand(awsParams))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished creating integration\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in creating integration: ', err.message));
      return;
    });

  return data;
};

api.createRoute = async (method, route, params) => {
  route ? console.log(starting(`Creating a "${method}" request to the route "${route}" in API #${params.Name}"`)) : console.log(starting(`Creating a "${method}" request to the main route of API #${params.Name}"`)) ;

  const awsParams = {
    ApiId: params.ApiId,
    RouteKey: method.toUpperCase() + ' /' + route,
    Target: params.Target
  };
  const data = await apiGateway.send(new CreateRouteCommand(awsParams))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished creating route\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in creating route: ', err.message));
      return;
    });

  return data;
};


api.createDeployment = async (params) => {
  console.log(starting(`Creating a deployment of "${params.Name}"`));
  const awsParams = {
    ApiId: params.ApiId,
  };

  const data = await apiGateway.send(new CreateDeploymentCommand(awsParams))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished creating deployment\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in creating deployment: ', err.message));
      return;
    });

  return data;
};

api.createStage = async (params) => {
  console.log(starting(`Creating a staged deployment of "${params.Name}"`));
  const awsParams = {
    ApiId: params.ApiId,
    StageName: '1',
    DeploymentId: params.DeploymentId,
    AutoDeployed: true
  };

  const data = await apiGateway.send(new CreateStageCommand(awsParams))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished creating staged deployment\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in creating staged deployment: ', err.message));
      return;
    });

  return data;
};

export default api;