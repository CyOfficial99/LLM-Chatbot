import { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

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

  return (
    <div className="chat-container">
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

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
