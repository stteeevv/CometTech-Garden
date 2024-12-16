import React, { useState } from "react";
import { useSession } from "next-auth/react";

export default function LogHarvest({ plot }) {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState("");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState(""); // New state variable for notes
    
    // Get current date and time
    const currentDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
    const currentTime = new Date().toTimeString().split(":").slice(0, 2).join(":"); // Format as HH:mm
    const [date, setDate] = useState(currentDate);
    const [time, setTime] = useState(currentTime);
    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const uploadHarvest = async () => {
        // Validate input
        if (!crop || !quantity || !date || !time) {
            // console.error("Missing required fields");
            window.alert("Missing required fields");
            return;
        }
        if (isNaN(quantity)) {
            // console.error("Quantity must be a number");
            window.alert("Quantity must be a number");
            return;
        }
        if (quantity <= 0) {
            // console.error("Quantity must be greater than 0");
            window.alert("Quantity must be greater than 0");
            return;
        }
        if (new Date(date) > new Date(currentDate)) {
            // console.error("Date cannot be in the future");
            window.alert("Date cannot be in the future");
            return;
        }
        let convertedEpochTime = new Date(`${date}T${time}`).getTime() / 1000;
        let harvester = session.user.email;
        const res = await fetch("/api/harvest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                plot,
                crop,
                quantity,
                convertedEpochTime,
                notes, 
                harvester
            }),
        });

        if (res.ok) {
            // Handle successful upload (e.g., notify user or reset form)
            setIsModalOpen(false);
        } else {
            // Handle error in the upload
            console.error("Error uploading harvest");
        }
    };

    return (
        <div>
            <button onClick={toggleModal} className="bg-black text-white p-2 rounded-md mt-4">
                Log Harvest
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex justify-center items-center" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-[#e4eed3] p-6 rounded-md w-1/3" onClick={(e) => e.stopPropagation()}>
                        {(!session || (!session.user.plots.includes(plot))) ? (
                            <>
                                {/* <h2 className="text-lg font-semibold mb-4">You must be signed in to log a harvest</h2> */}
                                {!session ? (
                                    <h2 className="text-lg font-semibold mb-4">You must be signed in to log a harvest</h2>
                                ) : (
                                    <h2 className="text-lg font-semibold mb-4">You must be assigned to plot {plot} to log a harvest</h2>
                                )}
                                <div className="flex justify-end">
                                    <button
                                        onClick={toggleModal}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold mb-4">Log Harvest for Plot {plot}</h2>
                                <form onSubmit={(e) => { e.preventDefault(); uploadHarvest(); }}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Crop Name</label>
                                        <input
                                            type="text"
                                            value={crop}
                                            onChange={(e) => setCrop(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Enter crop name"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Quantity (lbs)</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Enter quantity"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={date || currentDate} // Fallback to currentDate if no date is set
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Time</label>
                                        <input
                                            type="time"
                                            value={time || currentTime} // Fallback to currentTime if no time is set
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Enter any notes"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={toggleModal}
                                            className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                                            onClick={() => uploadHarvest()}
                                        >
                                            Log Harvest
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
