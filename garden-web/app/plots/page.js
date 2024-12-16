'use client'
import React, { useState, useEffect, useRef } from "react";
import Container from "../components/container";
import LineChart from "./lineChart";
import LogHarvest from "../components/log-harvest";
import Mapper from "./Mapper";
import data from "./imageMapData";

export default function Plots() {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loadingState, setLoadingState] = useState("none");
  const [parentWidth, setParentWidth] = useState(null);
  const parentRef = useRef(null);

  const onMapClick = (area, index) => {
    setLoadingState("loading");
    setSelectedPlot(index + 1);
  };

  useEffect(() => {
    const handleResize = () => {
      if (parentRef.current) {
        const width = parentRef.current.getBoundingClientRect().width;
        setParentWidth(width);
      }
    };

    // Initial calculation
    handleResize();

    // Recalculate on window resize
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Container title="Plots">
      <div className="flex flex-col">
        <div className="flex flex-col lg:flex-row place-content-around">
          <div
            className="w-full lg:w-1/4 p-2"
            ref={parentRef} // Attach ref to this parent container
          >
            <Mapper
              src={"plots.png"}
              data={data}
              onClick={onMapClick}
              parentWidth={parentWidth} // Dynamically set parent width
            />
          </div>
          <div className="flex flex-col justify-center align-center items-center w-full lg:w-3/4 pl-4">
            {loadingState === "none" ? (
              <></>
            ) : (
              <h1 className="justify-center w-fit rounded-lg text-[1.5rem] p-4 mb-4 bold font-jettBrains text-center bg-[#c2cbb4]">Plot {selectedPlot} Data</h1>
            )}
            {loadingState === "none" ? (
              <h1 className="text-center text-[2rem] border bg-[#c2cbb4] w-fit rounded-[2rem] p-8 font-jettBrains">
                Click on a plot to learn more
              </h1>
            ) : (
              <LineChart selectedPlot={selectedPlot} />
            )}
          </div>
        </div>
        {selectedPlot != null ? (
          <div className="w-1/4 p-2 md:">
            <LogHarvest plot={selectedPlot} />
          </div>
        ) : (
          <></>
        )}
      </div>
    </Container>
  );
}
