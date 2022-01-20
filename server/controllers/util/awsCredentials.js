// set up .env file accessibility
import dotenv from 'dotenv';
dotenv.config();

// root user credentials
const credentials = {
  accessKeyId: process.env.AKIARY42ZXW2KHZDLFPL,
  secretAccessKey: process.env.XRDq99v6w8yAW1TqvvJN1z2aODnzYDxnbX6R5a,
};

// set up AWS region
const region = "us-east-1";

const awsParams = {
  'region': region,
  'credentials': credentials,
};

export default awsParams;