"use client"; // Mark this file as a Client Component

import { useEffect, useState } from "react";
import styles from "./home.module.css";
import Container from "../components/container";
import StatusCard from "../components/statusCard.js";
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

import dynamoDb from "../utils/awsConfig.js";
import { useSession } from "next-auth/react";

import { Bar } from "react-chartjs-2";

import {
  Chart,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

Chart.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
});

async function deleteAllItems() {
  const scanParams = {
    TableName: "utd-comet-tech-harvest-data", // Table name
  };

  try {
    // Scan to get all items in the table
    const scanResponse = await client.send(new ScanCommand(scanParams));

    // Loop through each item and delete it
    for (const item of scanResponse.Items) {
      const deleteParams = {
        TableName: "utd-comet-tech-harvest-data", // Table name
        Key: {
          plot: { N: item.plot?.N }, // Partition Key (plot)
          timestamp: { N: item.timestamp?.N }, // Sort Key (timestamp)
        },
      };

      // Delete each item
      await client.send(new DeleteItemCommand(deleteParams));
    }

  } catch (error) {
    console.error("Error deleting items:", error);
  }
}

//deleteAllItems();

export default function Home() {
  const [harvestData, setHarvestData] = useState([]); // State to store data from DynamoDB
  const [loading, setLoading] = useState(true); // State for loading status
  const [totalHarvest, setTotalHarvest] = useState(0); // State to store total harvest for the current year
  const [monthlyAverages, setMonthlyAverages] = useState({});
  const [posts, setPosts] = useState([]);
  const [value, setValue] = useState("");
  const { data: session } = useSession();
  const [numOfStudents, setNumOfStudents] = useState(0);
  const [sensorData, setSensorData] = useState([null, null]);
  const [defPlaceHol, setDefPlaceHol] = useState("Send an update...");
  const [replyMsg, setReplyMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/harvestdata", { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to fetch harvest data");
        }
        const data = await response.json();
        const items = data.data;
        setHarvestData(items);

        const currentYear = new Date().getFullYear();
        if (!Array.isArray(items)) {
          console.error("Items is not an array:", items);
          return;
        }

        const total = items
          .filter((item) => {
            const year = new Date(item.timestamp * 1000).getFullYear();
            return year === currentYear;
          })
          .reduce((sum, item) => sum + Number(item.poundsHarvested), 0);

        const monthlyData = {};

        // Process monthly data for the current year
        items.forEach((item) => {
          const date = new Date(item.timestamp * 1000);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth(); // 0 = January, 11 = December
            if (!monthlyData[month]) {
              monthlyData[month] = {
                totalPounds: 0,
              };
            }
            monthlyData[month].totalPounds += item.poundsHarvested;
          }
        });

        // Convert monthly data into averages
        const monthlyAverages = {};
        for (const [month, data] of Object.entries(monthlyData)) {
          monthlyAverages[month] = data.totalPounds;
        }

        // Ensure every month is accounted for (even if no data exists)
        const fullMonthlyAverages = Array(12)
          .fill(0)
          .map((_, index) => monthlyAverages[index] || 0);

        // Set the state
        setMonthlyAverages(fullMonthlyAverages);
        setTotalHarvest(total);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch("/api/users/all");
        const data = await response.json();
        setNumOfStudents(data.length);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchUserCount();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const fetchPosts = async () => {
        try {
          const response = await fetch("/api/msgboard", { method: "GET" });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setPosts(data.data);
        } catch (error) {
          console.error("Error fetching all posts:", error);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      };
      fetchPosts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPlotData = async () => {
      try {
        const response = await fetch(`/api/plots/1`);
        const data = await response.json();
        let count = parseInt(data.Count) - 1;
        let latestData = data.Items[count];
        return latestData;
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };
    const interval = setInterval(async () => {
      const latestData = await fetchPlotData();
      if (latestData) {
        setSensorData([
          parseFloat(latestData.humidity.N),
          (parseFloat(latestData.temperature.N) * 9/5 + 32).toFixed(2)
        ]);
      }
    }, 10000); // Polling every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (event) => {
    setValue(event.target.value);
  };
  const handleClick = async () => {
    if (session != null) {
      try {
        try {
          const response = await fetch(`/api/msgboard`, {
            method: "POST",
            body: JSON.stringify({
              username: `${session.user.name}`,
              value: `${value}`,
              reply: `${replyMsg}`,
            }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error("Error fetching all posts:", error);
        }

        setValue("");
        setReplyMsg("");
        setDefPlaceHol("Send an update...");

        const fetchPosts = async () => {
          try {
            const response = await fetch("/api/msgboard", { method: "GET" });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPosts(data.data);
          } catch (error) {
            console.error("Error fetching all posts:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
        };
        await fetchPosts();
      } catch (error) {
        console.error("Error posting message or refreshing:", error);
      }
    } else {
      alert("Please sign in to post on the message board!");
      setDefPlaceHol("Please sign in to send an update...!");
      setValue("");
    }
  };

  const handleDelete = async (username, timestamp) => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/msgboard", { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data.data);
      } catch (error) {
        console.error("Error fetching all posts:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    };

    try {
      const response = await fetch(`/api/msgboard`, {
        // API to delete post
        method: "DELETE",
        body: JSON.stringify({ username, timestamp }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        // After deletion, refetch the posts to reload
        await fetchPosts();
      } else {
        console.error("Error deleting post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLike = async (username, timestamp, userLike) => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/msgboard", { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data.data);
      } catch (error) {
        console.error("Error fetching all posts:", error);
      }
    };

    try {
      const response = await fetch(`/api/msgboard`, {
        method: "PUT",
        body: JSON.stringify({ username, timestamp, userLike }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        await fetchPosts();
      } else {
        const result = await response.json();
        alert(result.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  const updatePlaceholder = (newPlaceholder) => {
    if (session) {
      setDefPlaceHol(newPlaceholder);
      setReplyMsg(newPlaceholder);
    } else {
      setDefPlaceHol("Please sign in to send an update...!");
      setReplyMsg();
      alert("Please sign in to post on the message board!");
    }
  };

  const clearReply = () => {
    setDefPlaceHol("Send an update...");
    setReplyMsg("");
  };

  const chartData = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        data: Object.values(monthlyAverages),
        backgroundColor: "#8846DD",
        borderColor: "#8846DD",
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: "category",
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sept",
          "Oct",
          "Nov",
          "Dec",
        ],
        title: {
          display: true,
          text: "Month",
          font: {
            size: 16,
            family: "Lato",
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 14.5,
            family: "Lato",
            weight: "normal",
          },
        },
        grid: {
          display: false,
          drawOnChartArea: false,
          borderColor: "rgba(0, 0, 0)",
          borderWidth: 1,
          drawTicks: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "LBS",
          font: {
            size: 16,
            family: "Lato",
            weight: "bold",
          },
        },
        ticks: {
          stepSize: 5, // Increments on the y-axis
          font: {
            size: 16,
            family: "Lato",
            weight: "normal",
          },
        },
        grid: {
          borderColor: "rgba(0, 0, 0)",
          borderWidth: 1,
          color: "rgba(0, 0, 0)", // Grid line color
          drawOnChartArea: true,
          drawTicks: false, // Do not draw ticks on the grid
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        bodyFont: {
          size: 12,
          family: "Lato",
          weight: "normal",
        },
      },
    },
  };

  return (
    <Container title={"Garden Updates"}>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="flex justify-center items-center w-full">
            <div className="flex flex-col sm:flex-row justify-center items-center w-full sm:w-3/4 bg-[#D9D9D9] mix-blend-multiply rounded-full p-2">
              <div className="flex items-center font-jettBrains text-xs sm:text-sm md:text-base">
                Plot 1
              </div>
              <div className="hidden sm:block border-l-2 sm:border-l-1 md:border-l-2 border-gray-400 h-4 sm:h-6 md:h-8 mx-4 my-2 sm:my-0"></div>
              <div className="flex items-center font-jettBrains text-xs sm:text-sm md:text-base">
                Current Temperature:{" "}
                {sensorData[1] !== null
                  ? `${sensorData[1]}°F`
                  : "Loading temperature..."}
              </div>
              <div className="hidden sm:block border-l-2 sm:border-l-1 md:border-l-2 border-gray-400 h-4 sm:h-6 md:h-8 mx-4 my-2 sm:my-0"></div>
              <div className="flex items-center font-jettBrains text-xs sm:text-sm md:text-base">
                Current Moisture:{" "}
                {sensorData[0] !== null
                  ? `${sensorData[0]}%`
                  : "Loading moisture..."}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-full">
            <div className="flex-1 flex flex-col p-6 max-h-[600px] sm:max-h-[700px] lg:max-h-[800px] xl:max-h-[1100px]">
              <div className="flex-1 overflow-y-auto">
                {posts.length === 0 ? (
                  <div className="flex items-center justify-center font-jettBrains text-xs sm:text-sm md:text-base">
                    Loading message board...
                  </div>
                ) : (
                  posts.map((item) => {
                    return (
                      <StatusCard
                        username={item.username}
                        message={item.message}
                        timestamp={item.timestamp}
                        likes={item.likeCount}
                        key={item.timestamp}
                        handleClick={handleDelete}
                        handleLike={handleLike}
                        isLikedByUser={
                          (session?.user?.name ?? "") in item.likes &&
                          item.likes[session?.user?.name ?? ""]?.BOOL === true
                        }
                        replyOrigin={item.reply}
                        updatePlaceholder={updatePlaceholder}
                      />
                    );
                  })
                )}
              </div>

              <div className="flex flex-col justify-center items-end h-24 mt-4">
                {defPlaceHol !== "Send an update..." &&
                  defPlaceHol !== "Please sign in to send an update...!" && (
                    <div className="w-full flex items-center justify-between bg-[#BFBFBF] mix-blend-multiply font-jettBrains rounded-full p-2 mb-1 px-6">
                      <span className="text-gray-700 text-sm">
                        Replying To:
                      </span>
                      <button
                        onClick={clearReply}
                        className="text-gray-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                <div className="bg-[#D9D9D9] mix-blend-multiply font-jettBrains w-full flex items-center h-10 rounded-full justify-between">
                  <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    maxLength="445"
                    placeholder={defPlaceHol}
                    className="bg-[#D9D9D9] w-4/5 flex-2 outline-none px-6 ml-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevents the default behavior
                        handleClick();
                      }
                    }}
                  />
                  <button onClick={handleClick} className="flex-2 mr-6">
                    <img src="/sendupdate.svg" alt="Submit" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 items-center justify-center">
              <div
                className={`flex flex-col items-center justify-center text-center gap-y-20`}
              >
                <div>
                  <div className={styles.heading_stats}>
                    Number of Harvest to date ({new Date().getFullYear()})
                  </div>

                  <div className={styles.heading_stats_num}>
                    {totalHarvest} lbs
                  </div>
                </div>
                <div style={{ width: "80%" }}>
                  {loading ? (
                    <p>Loading data...</p>
                  ) : (
                    <Bar data={chartData} options={chartOptions} />
                  )}
                </div>
                <div>
                  <div className={styles.heading_stats}>
                    Average harvests per month ({new Date().getFullYear()})
                  </div>
                  <div className={styles.heading_stats_num}>
                    {(totalHarvest / 12).toFixed(2)} lbs/month
                  </div>
                </div>
                <div>
                  <div className={styles.heading_stats}>
                    Number of active gardeners to date (
                    {new Date().getFullYear()})
                  </div>
                  <div className={styles.heading_stats_num}>
                    {numOfStudents} students
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
