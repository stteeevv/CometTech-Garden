import localFont from "next/font/local";

const jettBrains = localFont({
  src: "../fonts/JetBrainsMonoNL-Regular.ttf",
  display: "swap",
});

export default function Container({ children, title }) {
  return (
    <div className="w-[90vw] bg-[#D2E4B699] m-auto mt-16 p-8 pt-16 relative rounded-[15px]">
      <div className="bg-[#FFDAAF] lg:text-[2.5rem] text-[1rem] w-fit px-4 top-[-3vh] rounded-[2rem] left-[8%] absolute font-jettBrains font-[550]">
        <h1 className="drop-shadow-lg">{title} ☘</h1>
      </div>
      {children}
    </div>
  );
}
