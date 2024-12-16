// "use client";

import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import dynamoDb from "../../utils/awsConfig";

// Create a DynamoDB client
const client = dynamoDb;

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Define the scan command
    const scanCommand = new ScanCommand({
      TableName: process.env.NEXT_PUBLIC_HARVEST_LOG_TABLE,
    });

    // Execute the scan command
    const scanResponse = await client.send(scanCommand);

    // Process the data
    const items = scanResponse.Items
  .filter((item) => item.status?.S !== 'pending')
  .map((item) => ({
    plot: item.plot?.N,
    poundsHarvested: parseFloat(item.PoundsHarvested?.N) || 0,
    timestamp: parseInt(item.timestamp?.N) || 0,
    status: item.status?.S,
  }));

    // Respond with the processed data
    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("Error fetching harvest data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from DynamoDB" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const rawBody = await req.text();
  const { username, timestamp, message } = JSON.parse(rawBody);

  const Messageparams = {
    TableName: process.env.NEXT_PUBLIC_MESSAGE_BOARD_TABLE,
    Key: {
      plot: { N: String(username) },
      timestamp: { N: String(parseFloat(timestamp)) },
    },
  };

  try {
    const data = await dynamoDb.send(new DeleteItemCommand(Messageparams));
    cache.data = null;
    return new Response(
      JSON.stringify({ message: "Data deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error deleting data" }), {
      status: 500,
    });
  }
}