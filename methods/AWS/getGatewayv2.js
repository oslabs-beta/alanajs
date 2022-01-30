import { ApiGatewayV2Client, GetApiCommand, GetRouteCommand, GetRoutesCommand, GetIntegrationCommand, GetIntegrationsCommand, GetIntegrationResponsesCommand} from '@aws-sdk/client-apigatewayv2';
import { AwsParams } from '../util/aws.js';

const apiGateway = new ApiGatewayV2Client(AwsParams);

import { starting, error, fail, finished } from '../util/chalkColors.js';

const getHTTPApi = {};

getHTTPApi.getApi = async (params) => {
  params = {
    ApiId: params.ApiId,
  };
  const data = await apiGateway.send(new GetApiCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));

  return data;
};

getHTTPApi.getRoute = async (params) => {
  const awsParams = {
    ApiId: params.ApiId,
    RouteId: params.RouteId
  };
  const data = await apiGateway.send(new GetRouteCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
  
  return data;
};

getHTTPApi.getRoutes = async (params) => {
  const awsParams = {
    ApiId: params.ApiId,
    RouteId: params.RouteId
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
    IntegrationResponseId: params.IntegrationResponseId
  };
  const data = await apiGateway.send(new GetIntegrationCommand(awsParams))
  .then(data => {
    // console.log(data);
    console.log(finished('  Finished getting integration\n'));
    return data;
  })
  .catch(err => {
    console.log(error('Error in getting integration: ', err.message));
    return;
  });

return data;
};

getHTTPApi.getIntegrations = async (params) => {
  const awsParams = {
    ApiId: params.ApiId,
    IntegrationId: params.IntegrationId,
    IntegrationResponseId: params.IntegrationResponseId
  };
  const data = await apiGateway.send(new GetIntegrationsCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
    
  return data;
};

export default getHTTPApi;