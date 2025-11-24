// "use client";

// import Image from "next/image";
// import skillsynclogo from "../app/assets/skillsynclogo.png";
// import background from "../app/assets/background.png";

// import { useChat, Message } from "@ai-sdk/react";
// import PromptSuggestionRow from "./components/PromptSuggestionRow";
// import { LoadingBubble } from "./components/LoadingBubble";
// import Bubble from "./components/Bubble";

// import { useEffect, useRef } from "react";
// import { motion } from "framer-motion";

// export default function Home() {
//   const { input, handleInputChange, handleSubmit, messages, isLoading, append } =
//     useChat({
//       api: "/api/chat",
//     });

//   const noMessages = messages.length === 0;
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // auto-scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isLoading]);

//   const appendMessage = async (
//     msg: { role: Message["role"]; content: string }
//   ) => {
//     await append(msg);
//   };

//   const handlePrompt = (promptText: string) => {
//     appendMessage({
//       role: "user",
//       content: promptText,
//     });
//   };

//   return (
//     <div className="relative min-h-screen w-full flex justify-center items-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">

//       {/* Background */}
//       <Image
//         src={background}
//         alt="Background"
//         fill
//         priority
//         className="object-cover opacity-20 blur-sm z-0"
//       />

//       {/* Main Chat Card */}
//       <motion.main
//         initial={{ opacity: 0, scale: 0.9, y: 40 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//         className="relative z-10 w-[90vw] md:w-[70vh] h-[85vh]
//           bg-white/10 backdrop-blur-xl border border-white/20
//           rounded-3xl flex flex-col p-6 shadow-2xl"
//       >

//         {/* Logo */}
//         <motion.div
//           initial={{ opacity: 0, y: -15 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex justify-center mb-2"
//         >
//           <Image
//             src={skillsynclogo}
//             alt="SkillSync Logo"
//             width={100}
//             className="drop-shadow-xl"
//           />
//         </motion.div>

//         {/* Intro Text */}
//         {noMessages && (
//           <motion.p
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center text-black-200 text-md mt-2"
//           >
//             The Ultimate place for Formula One super fans.
//             <br />
//             Ask anything about F1!
//           </motion.p>
//         )}

//         {/* Suggestions */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full mt-4"
//         >
//           <PromptSuggestionRow onPromptClick={handlePrompt} />
//         </motion.div>

//         {/* Chat Messages */}
//         <section
//           className="flex-1 overflow-y-auto mt-4 px-2 space-y-3 hide-scrollbar"
//         >
//           {!noMessages && (
//             <>
//               {messages.map((message, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                 >
//                   <Bubble message={message} />
//                 </motion.div>
//               ))}

//               {isLoading && <LoadingBubble />}

//               <div ref={messagesEndRef} />
//             </>
//           )}
//         </section>

//         {/* Input Box */}
//         <form
//           onSubmit={handleSubmit}
//           className="w-full flex items-center gap-3 mt-4"
//         >
//           <input
//             type="text"
//             value={input}
//             onChange={handleInputChange}
//             placeholder="Ask your F1 question..."
//             className="flex-1 h-12 px-4 rounded-xl bg-white/20 
//               text-black placeholder-gray-600
//               backdrop-blur-lg shadow-inner outline-none 
//              "
//           />
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="h-12 px-5 rounded-xl bg-blue-700 hover:bg-blue-500 
//               text-white shadow-lg transition disabled:opacity-40"
//           >
//             Send
//           </button>
//         </form>
//       </motion.main>
//     </div>
//   );
// }

"use client";

import Image from "next/image";
import skillsynclogo from "../app/assets/skillsynclogo.png";
import background from "../app/assets/background.png";

import { useChat, Message } from "@ai-sdk/react";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import { LoadingBubble } from "./components/LoadingBubble";
import Bubble from "./components/Bubble";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { input, handleInputChange, handleSubmit, messages, isLoading, append } =
    useChat({ api: "/api/chat" });

  const noMessages = messages.length === 0;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const appendMessage = async (msg: { role: Message["role"]; content: string }) => {
    await append(msg);
  };

  const handlePrompt = (promptText: string) => {
    appendMessage({
      role: "user",
      content: promptText,
    });
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-black px-3 sm:px-4">

      {/* Background */}
      <Image
        src={background}
        alt="Background"
        fill
        priority
        className="object-cover opacity-20 blur-sm z-0"
      />

      {/* Chat Container */}
      <motion.main
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[70vh] h-[85vh]
          bg-white/10 backdrop-blur-xl border border-white/20
          rounded-3xl flex flex-col p-5 sm:p-6 shadow-2xl"
      >

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <Image
            src={skillsynclogo}
            alt="SkillSync Logo"
            width={100}
            className="drop-shadow-xl"
          />
        </div>

        {/* Intro Text (Only Before First Message) */}
        {/* {noMessages && ( */}
          <p className="text-center text-gray-600 text-sm sm:text-base mt-1">
            The Ultimate place for Formula One super fans.
            <br />
            Ask anything about F1! 
          </p>
        {/* )} */}

        {/* Suggestions Row (Only Before First Message) */}
        {noMessages && (
          <div className="w-full mt-4">
            <PromptSuggestionRow onPromptClick={handlePrompt} />
          </div>
        )}

        {/* Chat Messages */}
        <section className="flex-1 overflow-y-auto mt-4 px-1 space-y-3 hide-scrollbar">
          {!noMessages && (
            <>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Bubble message={message} />
                </motion.div>
              ))}

              {isLoading && <LoadingBubble />}

              <div ref={messagesEndRef} />
            </>
          )}
        </section>

        {/* Input Box */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex items-center ga-2 sm:gap-3 mt-3"
        >
          <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask your F1 question..."
          className="flex-1 h-12 px-4 rounded-xl 
          bg-white/20 backdrop-blur-lg shadow-inner
          text-black placeholder-gray-600 
          border border-white/30
          focus:border-white/50
          outline-none transition text-sm sm:text-base"
        />


          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-5 rounded-xl bg-[#398B9B] hover:bg-[398b9b]/80 
            text-white shadow-lg transition disabled:opacity-40 text-sm sm:text-base"
          >
            Send
          </button>
        </form>

      </motion.main>
    </div>
  );
}
