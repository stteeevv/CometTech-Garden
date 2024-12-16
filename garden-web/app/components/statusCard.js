import { useSession } from "next-auth/react"; // Make sure to import useSession correctly
import { useState, useEffect } from "react";

function StatusCard(props) {
  const { data: session } = useSession();
  const [timeStamp, setTimeStamp] = useState("");
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  useEffect(() => {
    const date = new Date(props.timestamp);

    // Extract components
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Combine into desired format
    setTimeStamp(`${month}/${day}/${year} ${hours}:${minutes} ${ampm}`);
  }, []);

  useEffect(() => {
    if (session) {
      setIsSessionLoaded(true);
    }
  }, [session]);

  const handleLike = async () => {
    props.handleLike(props.username, props.timestamp, session?.user?.name);
    if (!session) {
      alert("Sign in to like the post!");
    }
  };

  const onClick = async () => {
    if (props.username == session.user.name || session.user.role == "admin") {
      props.handleClick(props.username, props.timestamp);
    } else {
      alert("You can only delete your posts!");
    }
  };

  const onReply = async () => {
    const date = new Date(props.timestamp);

    // Extract components
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Combine into desired format
    const timstamp = `${month}/${day}/${year}`;
    const time = `${hours}:${minutes} ${ampm}`;

    props.updatePlaceholder(
      `Re: On ${timstamp} at ${time} ${
        props.username
      } wrote "${props.message.substring(0, 15)}...`
    );
  };

  return (
    <>
      <div className="rounded-lg p-4 shadow-md w- bg-[#D9D9D9] m-2 mix-blend-multiply mb-10">
        <div className="pb-2 mb-1 flex flex-row items-center justify-between">
          <h3 className="font-jettBrains font-[500] text-2xl">
            {props.username}
          </h3>
          <div className="text-500 text-sm">
            {timeStamp} {/* You can format this timestamp as needed */}
          </div>
        </div>
        <div className="mb-6">
          <p className="font-jettBrains font-[500] whitespace-pre-wrap text-gray">
            {props.replyOrigin}
          </p>
        </div>
        <div className="mb-4">
          <p className="font-jettBrains font-[500] whitespace-pre-wrap">
            {props.message}
          </p>
        </div>
        <div className="flex justify-end">
          <div className="px-0 py-2 text-md text-black rounded-lg font-jettBrains">
            {props.likes}
          </div>

          <button
            className="px-1 mx-2 py-2 text-sm text-white rounded-lg hover:bg-white focus:outline-none"
            onClick={handleLike}
          >
            {props.isLikedByUser ? (
              <img src="/thumbs_up_blue.svg" alt="like" />
            ) : (
              <img src="/thumb_up.svg" alt="like" />
            )}
          </button>
          <button
            className="px-4 py-2 text-sm text-white rounded-lg hover:bg-white focus:outline-none "
            onClick={onReply}
          >
            <img src="/reply.svg" alt="reply" />
          </button>
          {(props.username === (session?.user?.name || "") ||
            (session?.user?.role || "") === "admin") && (
            <button
              className="px-4 py-2 text-sm text-white rounded-lg focus:outline-none hover:bg-white"
              onClick={onClick}
            >
              <img src="/deleteIcon.svg" alt="delete" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default StatusCard;
