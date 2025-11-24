// components/Bubble.jsx or Bubble.tsx

import React from 'react';
// Assuming 'message' is of type { content: string, role: "user" | "assistant" }
// from the @ai-sdk/react useChat hook

const Bubble = ({ message }) => {
    const { content, role } = message;
    const displayContent = String(content || '');
    // Define base classes for all bubbles
    const baseClasses = 'max-w-[80%] my-3 p-3 rounded-xl whitespace-pre-wrap shadow-md';
    
    // Define role-specific classes
    const isUser = role === 'user';
    const bubbleClasses = isUser
        ? 'bg-[#398b9b] text-white ml-auto rounded-br-none' // User: Blue/Teal, aligned right
        : 'bg-gray-200 text-gray-800 mr-auto rounded-tl-none'; // Assistant: Light gray, aligned left

    // Define container alignment for the entire row
    const containerClasses = isUser 
        ? 'flex justify-end' // Align user messages to the right
        : 'flex justify-start'; // Align assistant messages to the left


    return (
        <div className={containerClasses}>
            <div className={`${baseClasses} ${bubbleClasses}`}>
                {/* We use dangerouslySetInnerHTML to correctly render markdown 
                  like newlines, lists, and bold text, especially for the 
                  Assistant's response which is often formatted. 
                  NOTE: If you use a library like 'react-markdown', you can remove this.
                */}
                <div dangerouslySetInnerHTML={{ __html: displayContent }} />
            </div>
        </div>
    );
}

export default Bubble;