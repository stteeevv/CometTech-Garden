import { DynamoDBClient, GetItemCommand, ScanCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import dynamoDb from '../../../utils/awsConfig';
// Define the GET handler function
export async function GET(req, { params }) {
  let { user } = params; // Dynamic route params in Next.js app directory
  //decode uri
  user = decodeURIComponent(user);
  const dynamoParams = {
      TableName: process.env.NEXT_PUBLIC_USERS_TABLE_NAME,
    Key: {
      email: { S: user },
    },
  };
  try {
    if (user == "all") {
      const data = await dynamoDb.send(new ScanCommand({ TableName: process.env.NEXT_PUBLIC_USERS_TABLE_NAME }));
      return new Response(JSON.stringify(data.Items), { status: 200 });
    }
    const data = await dynamoDb.send(new GetItemCommand(dynamoParams));
    if (!data.Item) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }
    // Return user data as JSON
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error fetching user data' }), { status: 500 });
  }
}

export async function POST(req, { params }) {
  let { user } = params; // Dynamic route params in Next.js app directory
  //decode uri
  user = decodeURIComponent(user);
  const rawBody = await req.text();
  const { name, role, plots } = JSON.parse(rawBody);

  const dynamoParams = {
    TableName: process.env.NEXT_PUBLIC_USERS_TABLE_NAME,
    Key: {
      email: { S: user },
    },
    UpdateExpression: 'SET #name = :name, #role = :role, #plots = :plots',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#role': 'role',
      '#plots': 'plots',
    },
    ExpressionAttributeValues: {
      ':name': { S: name },
      ':role': { S: role },
      ':plots': { L: plots.map(plot => ({ N: String(plot) })) },
    },
  };
  try {
    const data = await dynamoDb.send(new UpdateItemCommand(dynamoParams));
    return new Response(JSON.stringify({ message: 'User updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating user' }), { status: 500 });
  }
}