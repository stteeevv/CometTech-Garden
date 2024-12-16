import styles from "./about.module.css";
import Container from "../components/container";

const gardenDescription = `
Welcome to CometGarden, an innovative initiative designed to enhance the gardening experience at the University of Texas at Dallas Community Garden.

Our team is dedicated to bringing technology and sustainability together by developing a smart garden system. Using micro-controllers, wireless communication, sensors, and solar-powered solutions, we aim to provide real-time data on garden conditions.

CometGarden empowers the UTD community to participate in gardening more efficiently, fostering a sustainable and interactive approach to urban farming.
`;

const titleGreyBox = 'Our Team';

const ourNames = `Nolan Chasak(EE)      Huu Co(EE)         Phoebe Jin(CE)  
Jonathan Kitchen(EE)  Steven Nguyen(CE)  Laura Pinto(CE) 

-Senior Design Fall 2024 Team 2027 `;

export default function Home() {
    return (
        <Container title={"About Us"}>
            {/* Dark Green Box */}
            <div className="flex justify-center">   
                <div className="w-[90vw] sm:w-[80vw] md:w-[70vw] bg-[#D9D9D9] m-auto mt-1 p-8 pb-20 pt-10 relative rounded-[15px] mix-blend-multiply">
                    <h1 className="whitespace-pre-wrap font-jettBrains text-left text-base sm:text-lg md:text-xl lg:text-2xl">
                        {gardenDescription}
                    </h1>
                </div>
            </div>

            {/* Grey Box */}
            <div className="flex justify-center mt-10">
                <div className="w-[70vw] sm:w-[50vw] md:w-[30vw] bg-[#A59FCC] m-auto mt-1 p-8 pt-160 relative rounded-[50px] mix-blend-multiply bg-opacity-35">
                    <h1 className="whitespace-pre-wrap font-jettBrains w-[100%] text-center text-xl sm:text-2xl lg:text-3xl text-black font-bold">
                        {titleGreyBox}
                    </h1>
                </div>
            </div>

            {/* Last Dark Green Box */}
            <div className="flex justify-center mt-10">   
                <div className="w-[90vw] sm:w-[80vw] md:w-[70vw] bg-[#D9D9D9] m-auto mt-1 p-8 pt-160 relative rounded-[15px] mix-blend-multiply">
                    <h1 className="whitespace-pre-wrap font-jettBrains text-center text-sm sm:text-base md:text-xl lg:text-2xl font-bold">
                        {ourNames}
                    </h1>
                </div>
            </div>
        </Container>
    );
}
