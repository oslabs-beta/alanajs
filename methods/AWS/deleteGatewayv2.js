import { ApiGatewayV2Client, DeleteApiCommand, DeleteIntegrationCommand, DeleteRouteCommand } from '@aws-sdk/client-apigatewayv2';
import { AwsParams } from '../util/aws.js';

const apiGateway = new ApiGatewayV2Client(AwsParams);

import { starting, error, fail, finished } from '../util/chalkColors.js';

const api = {};

api.deleteApi = async (params) => {
  console.log(starting(`Deleting the API "${params.Name}"`));
  const data = await apiGateway.send(new DeleteApiCommand(params))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished deleting API\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in deleting API: ', err.message));
      return;
    });
  
  return data;
};

api.deleteIntegration = async (params) => {
  const data = await apiGateway.send(new DeleteIntegrationCommand(params))
    .then(data => {
    // console.log(data);
      console.log(finished('  Finished deleting integration\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in deleting integration: ', err.message));
      return;
    });

  return data;
};

api.deleteRoute = async (params) => {
  const data = await apiGateway.send(new DeleteRouteCommand(params))
    .then(data => {
      // console.log(data);
      console.log(finished('  Finished deleting route\n'));
      return data;
    })
    .catch(err => {
      console.log(error('Error in deleting route: ', err.message));
      return;
    });
  
  return data;
};

export default api;