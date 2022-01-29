import { ApiGatewayV2Client, GetApiCommand, GetRouteCommand, GetIntegrationsCommand, GetIntegrationResponsesCommand} from '@aws-sdk/client-apigatewayv2';
import { AwsParams } from '../util/aws.js';


const apiGateway = new ApiGatewayV2Client(AwsParams);

const getHTTPApi = {};

getHTTPApi.getApi = async (params) => {
  params = {
    ApiId: params.apiId,
  };
  const data = await apiGateway.send(new GetApiCommand(params))
    .then(data => console.log(data))
    .catch(err => console.log(err));

  return data;
};

getHTTPApi.getRoute = async (params) => {
  const awsParams = {
    ApiId: params.apiId,
    RouteId: params.routeId
  };
  const data = await apiGateway.send(new GetRouteCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
  
  return data;
};

getHTTPApi.getIntegrations = async (params) => {
  const awsParams = {
    ApiId: params.apiId,
    IntegrationId: params.integrationId,
    IntegrationResponseId: params.integrationResponseId
  };
  const data = await apiGateway.send(new GetIntegrationsCommand(awsParams))
    .then(data => console.log(data))
    .catch(err => console.log(err));
    
  return data;
};

export default getHTTPApi;