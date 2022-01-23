// set up .env file accessibility
import dotenv from 'dotenv';
dotenv.config();

// root user credentials
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// set up AWS region
const region = process.env.AWS_REGION;

const awsParams = {
  'region': region,
  'credentials': credentials,
};

export default awsParams;