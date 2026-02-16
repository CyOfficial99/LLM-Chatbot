import { useState, useEffect  } from 'react';
import './App.css';
import { callTest, fetchModelList } from "./api";

function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [message, setMessage] = useState("");
  const [models, setModels] = useState<string[]>([]);
  
  const sendMessage = () => {
    if (input.trim() === '') return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate AI response (replace this with API call)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: `You said: "${input}"` }
      ]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  const handlePlusClick = async () => {
    try {
      const result = await callTest();
      setMessage(result.message);
    } catch (error) {
      setMessage("Failed to call /test");
    }
  };


  useEffect(() => {
  const loadModels = async () => {
    try {
      const data = await fetchModelList();
      
      const modelNames = data.models.map((m: any) => m.model);

      setModels(modelNames);

      // Set default selected model if available
      if (modelNames.length > 0) {
        setSelectedModel(modelNames[0]);
      }

    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  loadModels();
}, []);


  return (
    <div className="chat-container">

      {/* Top Header */}
      <div className="chat-header">
        <div className="model-selector">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.length === 0 ? (
              <option disabled>Loading models...</option>
            ) : (
              models.map((modelName, index) => (
                <option key={index} value={modelName}>
                  {modelName}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="chat-title">
          My AI Chat
        </div>
      </div>

      <div className="uploaded-file">
        {"Text.pdf"}
      </div>

      {/* Chat Messages */}
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'user' ? 'user' : 'ai'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button className="plus-btn" onClick={handlePlusClick}>
          +
        </button>

        <button className="send-btn" onClick={sendMessage}>
          Send
        </button>
      </div>

    </div>
  );

}

export default App;
