"use client";

import Image from "next/image";
import skillsynclogo from "../app/assets/skillsynclogo.png";
import background from "../app/assets/background.png";

import { useChat } from "@ai-sdk/react";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import { LoadingBubble } from "./components/LoadingBubble";
import Bubble from "./components/Bubble";
import { Message } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

export default function Home() {
  const { input, handleInputChange, handleSubmit, messages, isLoading, append } =
    useChat({
      api: "/api/chat",
    });

  const noMessages = messages.length === 0;
  
  // Ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // -------------------------------
  // FIXED appendMessage()
  // -------------------------------
  const appendMessage = async (msg: { role: string; content: string }) => {
    await append(msg);
  };

  // -------------------------------
  // When clicking a suggestion bubble
  // -------------------------------
  const handlePrompt = (promptText: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: promptText,
    };

    appendMessage({
      role: "user",
      content: promptText,
    });

    return userMessage;
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center items-center overflow-hidden bg-black">

      {/* Background Image */}
      <Image
        src={background}
        alt="Background"
        fill
        priority
        className="object-cover opacity-40 z-0"
      />

      {/* Chat Container */}
      <main className="relative z-10 w-[80vh] h-[80vh] bg-gradient-to-b from-neutral-100 to-neutral-300 
        rounded-[15px] flex flex-col justify-between items-center p-5 shadow-xl border border-gray-300">

        {/* Logo */}
        <Image
          src={skillsynclogo}
          alt="SkillSync Logo"
          width={150}
          className="mt-4"
        />

        {/* Chat Section with Scroll */}
        <section
          ref={chatSectionRef}
          className={`w-full flex-1 overflow-y-auto px-5 mt-5 ${
            noMessages ? "" : "flex flex-col"
          }`}
        >
          {noMessages ? (
            <>
              <p className="mt-10 text-center text-lg starter-text">
                The Ultimate place for Formula One super fans.
                <br />
                Don't ask me about anything else!
              </p>

              <PromptSuggestionRow onPromptClick={handlePrompt} />
            </>
          ) : (
            <>
              {messages.map((message, index) => (
                <Bubble key={`msg-${index}`} message={message} />
              ))}

              {isLoading && <LoadingBubble />}
              
              {/* Invisible div at the bottom for auto-scroll */}
              <div ref={messagesEndRef} />
            </>
          )}
        </section>

        {/* Input Box */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex items-center border-t border-gray-400 pt-4"
        >
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about Formula 1..."
            className="flex-1 h-10 ml-4 rounded-md px-3 text-black focus:outline-none"
          />

          <input
            type="submit"
            value="Send"
            disabled={isLoading}
            className="ml-3 mr-4 w-20 h-10 rounded-md bg-[#398b9b] text-white cursor-pointer disabled:opacity-50"
          />
        </form>
      </main>
    </div>
  );
}