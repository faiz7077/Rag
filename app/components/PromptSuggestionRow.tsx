import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({onPromptClick}) => {

    const prompts = [
        "Who is the best F1 driver of all time?",
        "What are the top 5 F1 teams in history?",
        "How has F1 technology evolved over the years?",
        "What are some memorable F1 races?",
        "How does AI impact F1 racing strategies?"
    ]
  return (
    <div className="prompt-suggestion-row">
        {prompts.map((prompt, index) => 
            <PromptSuggestionButton 
                key={`suggestion-${index}`}
                text={prompt}
                onClick={() =>{onPromptClick(prompt)}}
                />
            )}
    </div>
  );
}   

export default PromptSuggestionRow;