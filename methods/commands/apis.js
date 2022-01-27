import api from '../AWS/gatewayv2.js';
import lambda from '../AWS/lambda.js';

import { starting, code, error, finished } from '../util/chalkColors.js';

const apis = async (options) => {
  const getParams = {
    apiId: '92bwj2pi0c',
    routeId: 'pw3cvvf',
    integrationId: '79m6t9f',
    integrationResponseId: '',
  };

  const route = '/';
  const integrationid = 'j6zyc8u';

  const params = {
    apiId: '590kmb6j21',
    name: 'testsdkapi2',
    description: 'this is a test api using sdk',
    routeKey: 'GET ' + route,
    integrationUri: 'arn:aws:lambda:us-east-1:122194345396:function:Eser',
    integrationId: integrationid,
    target:'integrations/' + integrationid,
    deploymentId: 'kp44ul'
  };

  // api.createApi(params);
  // api.createIntegration(params);
  // api.createRoute(params);
  // lambda.addPermission('Eser', params.apiId, '/*/GET' + route);
  // api.createDeployment(params);
  // api.createStage(params);

  // order of operations to linking lambda to api
  // creat the api. Get the apiId from the data returned
  // create an integration for lambda to be called. get the integrationId from the data returned
  // create the route for teh api and attach the integration
  // create a deployment. get the deploymentId
  // create a stage.
  // look at it online
};

export default apis;