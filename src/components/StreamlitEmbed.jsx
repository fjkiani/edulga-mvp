import React from "react";

// This component renders the iframe for the embedded Streamlit app
const StreamlitEmbed = () => {
  return (
    <div className="bg-white w-full h-[600px] rounded-2xl shadow-lg overflow-auto">
      <iframe
        src="https://edulga-mvp.streamlit.app/?embedded=true"
        title="Knowledge Graph AI Agent"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="yes"
        allow="clipboard-write; clipboard-read"
        className="rounded-2xl"
      ></iframe>
    </div>
  );
};

export default StreamlitEmbed;
