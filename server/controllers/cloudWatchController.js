import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';

import awsParams from './util/awsCredentials.js';

// create the cwClient
const cwClient = new CloudWatchClient(awsParams);

const cloudWatchController = {};

// not finished. copied from shepherd
cloudWatchController.getMetrics = async (req, res, next) => {
    //initialize the variables for creating the inputs for AWS request
  let graphPeriod, graphUnits, graphMetricName, graphMetricStat;

  graphMetricName = req.params.metricName;

  if (req.body.timePeriod === '30min') {
    [graphPeriod, graphUnits] = [30, 'minutes'];
  } else if (req.body.timePeriod === '1hr') {
    [graphPeriod, graphUnits] = [60, 'minutes'];
  } else if (req.body.timePeriod === '24hr') {
    [graphPeriod, graphUnits] = [24, 'hours'];
  } else if (req.body.timePeriod === '7d') {
    [graphPeriod, graphUnits] = [7, 'days'];
  } else if (req.body.timePeriod === '14d') {
    [graphPeriod, graphUnits] = [14, 'days'];
  } else if (req.body.timePeriod === '30d') {
    [graphPeriod, graphUnits] = [30, 'days'];
  }

  if (!req.body.metricStat) graphMetricStat = 'Sum';
  else graphMetricStat = req.body.metricStat;

  //Metrics for All Functions (combined)
  //Prepare the input parameters for the AWS getMetricsData API Query
  const metricAllFuncInputParams = AWSUtilFunc.prepCwMetricQueryLambdaAllFunc(
    graphPeriod,
    graphUnits,
    graphMetricName,
    graphMetricStat
  );

  try {
    const metricAllFuncResult = await cwClient.send(
      new GetMetricDataCommand(metricAllFuncInputParams)
    )}
    catch(error) {
      console.log(error);
    }
}

export default cloudWatchController;