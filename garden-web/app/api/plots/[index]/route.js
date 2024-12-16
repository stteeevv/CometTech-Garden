import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import dynamoDb from "../../../utils/awsConfig";
const cache = new Map(); // In-memory cache
// const CACHE_TTL = 60 * 60 * 1000;
const CACHE_TTL = 5; 

export async function GET(req, { params }) {
  let { index } = params; 

  // Check the cache
  const cachedData = cache.get(index);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cachedData.data), { status: 200 });
  }

  const dynamoParams = {
    TableName: process.env.NEXT_PUBLIC_SENSOR_DATA_TABLE,
    KeyConditionExpression: "plot = :plotVal",
    ExpressionAttributeValues: {
      ":plotVal": { N: index }, // Assuming plot is a number
    },
  };

  try {
    const data = await dynamoDb.send(new QueryCommand(dynamoParams));
    if (!data.Items) {
      return new Response(JSON.stringify({ message: 'Data not found' }), { status: 404 });
    }

    // Cache the data with the current timestamp
    cache.set(index, { data, timestamp: Date.now() });

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error fetching data' }), { status: 500 });
  }
}
