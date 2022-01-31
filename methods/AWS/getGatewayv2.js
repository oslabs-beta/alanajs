import { ApiGatewayV2Client, GetApiCommand, GetApisCommand, GetRouteCommand, GetRoutesCommand, GetIntegrationCommand, GetIntegrationsCommand } from '@aws-sdk/client-apigatewayv2';
import { AwsParams } from '../util/aws.js';

const apiGateway = new ApiGatewayV2Client(AwsParams);

import { starting, error, fail, finished } from '../util/chalkColors.js';

const getHTTPApi = {};

getHTTPApi.getApi = async (params) => {
  const data = await apiGateway.send(new GetApiCommand(params))
    .then(data => {
      // console.log(data);
      return data;
    })
    .catch(err => {
      console.log(error('Error in getting API information: ', err.message));
      return;
    });

  return data;
};

getHTTPApi.getApis = async () => {
  console.log(starting('Getting a list of all APIs'));
  const data = await apiGateway.send(new GetApisCommand({}))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished getting APIs\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in getting APIs: ', err.message));
      return;
    });

  return data;
};

getHTTPApi.getRoute = async (params) => {
  const awsParams = {
    ApiId: params.ApiId,
    RouteId: params.RouteId
  };
  const data = await apiGateway.send(new GetRouteCommand(awsParams))
    .then(data => {
      // console.log(data);
      return data;
    })
    .catch(err => {
      console.log(error('Error in getting route information: ', err.message));
      return;
    });

  return data;
};

getHTTPApi.getRoutes = async (params) => {
  console.log(starting('Getting a list of all routes'));
  const awsParams = {
    ApiId: params.ApiId,
  };
  const data = await apiGateway.send(new GetRoutesCommand(awsParams))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished getting routes\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in getting routes: ', err.message));
      return;
    });

  return data;
};

getHTTPApi.getIntegration = async (params) => {
  const awsParams = {
    ApiId: params.ApiId,
    IntegrationId: params.IntegrationId,
  };

  console.log(awsParams);
  
  const data = await apiGateway.send(new GetIntegrationCommand(awsParams))
    .then(data => {
      // console.log(data);
      return data;
    })
    .catch(err => {
      console.log(error('Error in getting integration: ', err.message));
      return;
    });

  return data;
};

getHTTPApi.getIntegrations = async (params) => {
  console.log(starting('Getting a list of all integrations'));
  const awsParams = {
    ApiId: params.ApiId,
    IntegrationId: params.IntegrationId,
    IntegrationResponseId: params.IntegrationResponseId
  };
  const data = await apiGateway.send(new GetIntegrationsCommand(awsParams))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished getting integrations\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in getting integrations: ', err.message));
      return;
    });

  return data;
};

export default getHTTPApi;