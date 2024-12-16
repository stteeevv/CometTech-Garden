import {
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoDb from "../../utils/awsConfig";
import { NextResponse } from "next/server";

export async function POST(req) {
  const currentTimestamp = Date.now(); // Get the current timestamp in milliseconds
  const body = await req.json();
  const { username, value, reply } = body;

  const params = {
    TableName: process.env.NEXT_PUBLIC_MESSAGE_BOARD_TABLE, // Replace with your table name
    Item: {
      username: { S: username }, // Add sessionStorage/ LocalStorage which stores a persons full name from account, to use here (not secure, but fast and easy)
      timestamp: { N: currentTimestamp.toString() }, // Correct timestamp in milliseconds
      message: {
        S: value,
      },
      likes: { M: {} }, // Initialize likes as an empty map
      likeCount: { N: "0" }, // Initialize likeCount to 0
      replyOrigin: { S: reply || "" } //Reply to whoever
    },
  };

  try {
    const data = await dynamoDb.send(new PutItemCommand(params));
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ status: 500 });
  }
}

export async function PUT(req) {
  const body = await req.json();
  const { username, timestamp, userLike } = body;

  if (!username || !timestamp) {
    return NextResponse.json({
      status: 400,
      message: "Missing username, timestamp, or action",
    });
  }
  const params = {
    TableName: process.env.NEXT_PUBLIC_MESSAGE_BOARD_TABLE,
    Key: {
      username: { S: username },
      timestamp: { N: timestamp.toString() },
    },
  };

  try {
    params.UpdateExpression =
      "SET #likes.#user = :liked, #likeCount = if_not_exists(#likeCount, :start) + :increment";
    params.ConditionExpression = "attribute_not_exists(#likes.#user)";
    params.ExpressionAttributeNames = {
      "#likes": "likes",
      "#user": userLike,
      "#likeCount": "likeCount",
    };
    params.ExpressionAttributeValues = {
      ":liked": { BOOL: true },
      ":start": { N: "0" },
      ":increment": { N: "1" },
    };

    const data = await dynamoDb.send(new UpdateItemCommand(params));

    return NextResponse.json({ status: 200, data });
  } catch (error) {
    try {
      params.UpdateExpression =
        "REMOVE #likes.#user SET #likeCount = if_not_exists(#likeCount, :start) - :decrement";
      params.ConditionExpression = "attribute_exists(#likes.#user)";
      params.ExpressionAttributeNames = {
        "#likes": "likes",
        "#user": userLike,
        "#likeCount": "likeCount",
      };
      params.ExpressionAttributeValues = {
        ":start": { N: "0" },
        ":decrement": { N: "1" },
      };
      const data = await dynamoDb.send(new UpdateItemCommand(params));
      return NextResponse.json({ status: 200, data });
    } catch (error) {
      console.error("Error updating likes:", error.message);
      return NextResponse.json({
        status: 500,
        message: "Error updating likes",
      });
    }
  }
}

export async function GET(req) {
  const scanParams = {
    TableName: process.env.NEXT_PUBLIC_MESSAGE_BOARD_TABLE,
  };

  try {
    const scanResponse = await dynamoDb.send(new ScanCommand(scanParams));

    if (!scanResponse.Items) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const items = scanResponse.Items.map((item) => ({
      username: item.username?.S,
      timestamp: parseInt(item.timestamp?.N) || 0,
      message: item.message?.S,
      likeCount: item.likeCount?.N,
      likes: item.likes.M,
      reply: item.replyOrigin?.S
    }));

    const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ data: sortedItems }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data from DynamoDB:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const body = await req.json();
  const { username, timestamp } = body;

  const params = {
    TableName: process.env.NEXT_PUBLIC_MESSAGE_BOARD_TABLE, // Replace with your table name
    Key: {
      username: { S: username },
      timestamp: { N: timestamp.toString() },
    },
  };

  try {
    const data = await dynamoDb.send(new DeleteItemCommand(params));
    return new NextResponse(
      JSON.stringify({ message: "Data deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Error deleting data" }),
      {
        status: 500,
      }
    );
  }
}
