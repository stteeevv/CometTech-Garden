import { DynamoDBClient, PutItemCommand, ScanCommand, DeleteItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import dynamoDb from '../../utils/awsConfig';

// Define the POST handler function
export async function POST(req) {
  const rawBody = await req.text();  // This reads the stream as a string
  const { plot, crop, quantity, convertedEpochTime, notes, harvester } = JSON.parse(rawBody);
  const dynamoParams = {
    TableName: process.env.NEXT_PUBLIC_HARVEST_LOG_TABLE,
    Item: {
      id: { S: uuidv4() }, 
      plot: { N: String(parseInt(plot)) }, 
      timestamp: { N: String(parseFloat(convertedEpochTime)) }, 
      PoundsHarvested: { N: String(parseFloat(quantity)) }, 
      notes: { S: notes + "test"}, 
      crop: { S: crop }, 
      harvester: { S: harvester }, 
      status: { S: 'pending' }, 
    },
  };
  
  try {
    const data = await dynamoDb.send(new PutItemCommand(dynamoParams));
    cache.data = null; 
    return new Response(JSON.stringify({ message: 'Data saved successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error saving data' }), { status: 500 });
  }
}

const cache = {
  data: null,  // Cached data
  timestamp: null,  // Timestamp of when the cache was updated
};
const CACHE_TTL = 5 * 60 * 1000; // Cache time-to-live (5 minutes)

export async function GET(req) {
  // Check if cached data exists and is still valid
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cache.data), { status: 200 });
  }

  // Fetch data from DynamoDB if no valid cache exists
  const dynamoParams = {
    TableName: process.env.NEXT_PUBLIC_HARVEST_LOG_TABLE,
  };

  try {
    const data = await dynamoDb.send(new ScanCommand(dynamoParams));

    // Update the cache with new data and timestamp
    cache.data = data;
    cache.timestamp = Date.now();
    if (data.Items.length === 0) {
      return new Response(JSON.stringify({ message: 'No data found' }), { status: 404 });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ message: 'Error fetching data' }), { status: 500 });
  }
}

// Define the DELETE handler function
export async function DELETE(req) {
  const rawBody = await req.text();  
  const { plot, timestamp, id } = JSON.parse(rawBody);

  const dynamoParams = {
    TableName: process.env.NEXT_PUBLIC_HARVEST_LOG_TABLE,
    Key: {
      plot: { N: String(parseInt(plot)) },
      timestamp: { N: String(parseFloat(timestamp)) },
    },
  };

  try {
    const data = await dynamoDb.send(new DeleteItemCommand(dynamoParams));
    cache.data = null;  
    return new Response(JSON.stringify({ message: 'Data deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error deleting data' }), { status: 500 });
  }
}

export async function PUT(req) {
  const rawBody = await req.text();  
  const { plot, timestamp, id } = JSON.parse(rawBody);

  const dynamoParams = {
    TableName: process.env.NEXT_PUBLIC_HARVEST_LOG_TABLE,
    Key: {
      plot: { N: String(parseInt(plot)) },
      timestamp: { N: String(parseFloat(timestamp)) },
    },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': { S: 'approved' },
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const data = await dynamoDb.send(new UpdateItemCommand(dynamoParams));
    cache.data = null;  
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}