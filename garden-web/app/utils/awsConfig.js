// utils/awsConfig.js
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoDb = new DynamoDB({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
export default dynamoDb;