import React, { useState, useEffect, useRef } from 'react';
import "./chat.scss"
import { useAppContext } from '../../context/AppContext';


const API_KEY = "AIzaSyCU_3pVcZZOwqBh448m-G7NduL613sQ63M";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;


// System instruction for the model to define its persona and rules.
const SYSTEM_INSTRUCTION = `
You are a friendly and helpful NASA Space Apps Chatbot, specialized in NASA, space, and asteroid simulation. 
Your primary focus is to answer questions based on the user's query.

IMPORTANT: The user's query will be followed by a [SIMULATOR_CONTEXT] block containing the current simulation settings. If the user asks a question about the 'current threat level', 'diameter', 'velocity', 'angle', or 'impact location', you MUST use the data provided in the [SIMULATOR_CONTEXT] block for your answer, regardless of other knowledge.

For any question that is clearly unrelated to space, NASA, or the Space Apps Challenge, you must politely respond with: 
"❌ Sorry, I can only answer questions about NASA, Space, and NASA Space Apps Challenge. Try asking something like: 'What is the Space Apps Challenge?'"
`;

// Predefined quick questions as requested
const QUICK_QUESTIONS = [
    "What is the NASA Space Apps Challenge?",
    "Tell me about the Artemis program.",
    "What are the latest discoveries about Mars?",
    "How can I join a 'Meteor Madness' team?",
    "What happens when an asteroid impacts Earth?",
];

// Utility function to handle fetch with exponential backoff for robustness
const fetchWithRetry = async (url, options) => {
    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response.json();
            } else if (response.status === 429 && i < 2) {
                // Rate limit, wait and retry
                const delay = Math.pow(2, i) * 1000 + (Math.random() * 500); // jitter
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Non-retryable error
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
        } catch (error) {
            if (i === 2) {
                console.error("Fetch failed after multiple retries:", error);
                throw new Error("Could not connect to the service.");
            }
            const delay = Math.pow(2, i) * 1000 + (Math.random() * 500);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};


const App = () => {
    // Retrieve the application state using the provided hook (now a mock)
    const { state } = useAppContext();

    // Updated messages structure to include a unique 'id' for better React list rendering
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "bot",
            text: "👋 Hi! I’m your NASA Space Apps Chatbot. Ask me anything about NASA, space, or the Space Apps Challenge! \n\n (I can also use Google Search to find current information!)\n\n*Note: Current simulation data is mocked for display purposes.*",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to the bottom of the chat body on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const toggleChat = () => setIsChatOpen(prev => !prev);

    const typeResponse = (fullText) => {
        let currentText = '';
        let i = 0;
        const typingInterval = 12;
        const interval = setInterval(() => {
            if (i < fullText.length) {
                currentText += fullText.charAt(i);
                i++;

                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;

                    if (newMessages[lastIndex] && newMessages[lastIndex].sender === 'bot') {
                        newMessages[lastIndex].text = currentText;
                        newMessages[lastIndex].isTyping = true;
                    }
                    return newMessages;
                });
            } else {
                clearInterval(interval);
                setLoading(false);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex] && newMessages[lastIndex].sender === 'bot') {
                        delete newMessages[lastIndex].isTyping;
                    }
                    return newMessages;
                });
            }
        }, typingInterval);
    };


    const handleSend = async (customInput = null) => {

        const userText = customInput || input.trim();
        if (!userText || loading) return;

        // 1. Add User Message
        const userMessage = { sender: "user", text: userText, id: Date.now() };
        setMessages((prev) => [...prev, userMessage]);
        if (!customInput) setInput("");

        setLoading(true); // Disable input and buttons immediately

        // === START: DYNAMIC STATE CONTEXT INJECTION ===
        const simulationParams = state?.simulationParams || {};
        const asteroid = state?.selectedAsteroid || "N/A";

        const stateContext = `\n\n[SIMULATOR_CONTEXT]\nCurrent Threat Level: ${state?.threatLevel || 'Unknown'}\nSelected Asteroid: ${asteroid}\nImpact Location: ${simulationParams.location || 'N/A'}\nDiameter: ${simulationParams.diameter || 'N/A'} meters\nVelocity: ${simulationParams.velocity || 'N/A'} km/s\nAngle: ${simulationParams.angle || 'N/A'} degrees\n[/SIMULATOR_CONTEXT]`;
        const queryWithContext = userText + stateContext;
        // === END: DYNAMIC STATE CONTEXT INJECTION ===

        const payload = {
            contents: [{ parts: [{ text: queryWithContext }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            tools: [{ "google_search": {} }],
        };

        try {
            const result = await fetchWithRetry(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "⚠️ No response text found. Please check the network connection.";

            // Handle citations
            let sources = [];
            const groundingMetadata = result?.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                sources = groundingMetadata.groundingAttributions
                    .map(attribution => ({
                        uri: attribution.web?.uri,
                        title: attribution.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
            }

            // Append sources to the response text for display
            if (sources.length > 0) {
                const sourceList = sources.slice(0, 3).map((s, i) =>
                    `${i + 1}. [${s.title.substring(0, 50)}${s.title.length > 50 ? '...' : ''}](${s.uri})`
                ).join('\n');
                responseText += `\n\n---\n**Sources:**\n${sourceList}`;
            }

            // 2. Add an empty placeholder bot message to start typing into
            const botMessageId = Date.now() + 100;
            setMessages((prev) => [...prev, { sender: "bot", text: "", id: botMessageId }]);

            // 3. Start the typing effect. It will call setLoading(false) when complete.
            typeResponse(responseText);

        } catch (err) {
            console.error(err);
            // On API error, add the error message and re-enable input
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "⚠️ Error: Could not fetch response. Please try again.", id: Date.now() + 200 },
            ]);
            setLoading(false);
        }
    };

    return (
        <>


            <div className="chat-fixed-container">
                <button
                    className={`chat-toggle-button ${isChatOpen ? 'open-icon' : 'closed-icon'}`}
                    onClick={toggleChat}
                    aria-expanded={isChatOpen}
                    aria-controls="nasa-chatbot"
                >
                    <img
                        src="./chatbotlogo.gif"
                        alt="Chat Icon"
                        style={{ width: '180px', height: '180px' }}
                    />
                </button>


                {/* Chat Wrapper - visible only when open */}
                <div
                    id="nasa-chatbot"
                    className={`chat-wrapper ${isChatOpen ? 'open' : 'closed'}`}
                >
                    {/* Header with CLOSE button */}
                    <div className="chat-header">
                        <div className="chat-header-title">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            NASA Space Apps Chatbot
                        </div>
                        <button className="chat-close-button" onClick={toggleChat} aria-label="Close Chat">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="chat-body">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                                <div
                                    className={`chat-message-bubble ${msg.sender}`}
                                >
                                    {/* Render text, replace newlines/bolding */}
                                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    {/* Add blinking cursor if message is currently being typed */}
                                    {msg.isTyping && <span className="typing-cursor"></span>}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message-row bot">
                                <div className="chat-message-bubble bot loading">
                                    <span className="animate-pulse">🤔Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions & Input Area (Now visually merged with Chat Body) */}
                    <div className="chat-input-area">
                        {/* Quick Questions (Always visible in the input area) */}
                        <div className="quick-questions">
                            {QUICK_QUESTIONS.map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(q)}
                                    disabled={loading}
                                    className="quick-question-button"
                                    title={q}
                                >
                                    {q.length > 30 ? q.substring(0, 27) + '...' : q}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="chat-input-group">
                            <input
                                type="text"
                                value={input}
                                placeholder="Ask about NASA, space, or Space Apps..."
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                disabled={loading}
                                className="chat-input"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || input.trim() === ""}
                                className="chat-send-button"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
