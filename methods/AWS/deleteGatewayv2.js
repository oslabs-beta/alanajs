import { ApiGatewayV2Client } from '@aws-sdk/client-apigatewayv2';
import { AwsParams } from '../util/aws.js';

const apiGateway = new ApiGatewayV2Client(AwsParams);

import { starting, error, fail, finished } from '../util/chalkColors.js';

const api = {};

export default api;