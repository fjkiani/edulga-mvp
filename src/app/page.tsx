'use client';
import IconEdulga from "@/assets/IconEdulga";
import Header from "@/components/Header";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import Image from "next/image";
import graphTemp from "@/assets/graph.png";
import AiAvatar from "@/components/AiAvatar";
import SimliOpenAI from "@/components/SimliOpenAI";
import StreamlitEmbed from "@/components/StreamlitEmbed"; // Import the new component

interface Node {
  nodeName: string;
  edges: string[];
  description: string;
  tokenID: string;
}

export default function Home() {
  const graphData: Node[] = [
    {
      nodeName: "Computer Science",
      edges: ["AI000", "DS000", "NW000", "SE000", "DB000", "OS000", "AL000"],
      description: "The study of computation, information, and automation",
      tokenID: "CS101",
    },
    // Other nodes...
  ];

  return (
    <div className="">
      <Header />
      <div className="h-[108px]" />
      <div className="p-8">
        <div className="flex w-full justify-center items-start gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            <div className="bg-white w-[1000px] h-[600px] rounded-2xl shadow-lg p-4">
              <div className="bg-[#0B0532] w-full h-full rounded-2xl overflow-hidden">
                <StreamlitEmbed />
              </div>
            </div>
            {/* Roadmap */}
            {/* <div className="bg-white w-[1000px] h-[500px] rounded-2xl shadow-lg">
              <div className="bg-gray-300 w-full h-[64px] rounded-t-2xl flex items-center justify-start p-4">
                <b>Learning</b>              
              </div>
            </div> */}
          </div>
          {/* Right Column */}
          <div className="flex flex-col gap-8">
            <div className="bg-white w-[500px] h-[500px] rounded-2xl shadow-lg p-4 overflow-hidden">
              <SimliOpenAI 
                simli_faceid="c0a99dcb-e5ac-44c4-b1be-2981ddaf5f51"
                openai_voice="echo"
                initialPrompt="You are Isaac Newton, a mentor guiding students in their studies. Start by asking about their interests and study style, then provide professional advice and guidance."
                onStart={() => console.log("SimliOpenAI started")}
                onClose={() => console.log("SimliOpenAI closed")}
              />
            </div>
            {/* Communities Section */}
            <div className="bg-white w-[500px] rounded-2xl shadow-lg">
              <div className="bg-gray-300 w-full h-[64px] rounded-t-2xl flex items-center justify-start p-4">
                <b>Community</b>
              </div>
              <div className="p-4 flex gap-4 flex-wrap">
                <div className="bg-[#FFCB86] py-2 px-4 w-fit rounded flex flex-col cursor-pointer hover:bg-opacity-70">
                  <b>Intro to NLP</b>
                  <p className=" text-xs">40 members</p>
                </div>

                <div className="bg-[#FFCB86] py-2 px-4 w-fit rounded flex flex-col cursor-pointer hover:bg-opacity-70">
                  <b>AI enthusiasts</b>
                  <p className=" text-xs">+99 members</p>
                </div>

                <div className="bg-[#FF4086] py-2 px-4 w-fit rounded flex flex-col cursor-pointer hover:bg-opacity-70 text-white">
                  <b>Getting into the world of NLP</b>
                  <p className=" text-xs">
                    Event - 20th Oct 2025 - 19:30 to 21:30
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
