import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import "./ChatBot.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Welcome to ERB Assistant 🚀 How can I help you today?",
      time: getCurrentTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [listening, setListening] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  /* =========================
     TIME FORMAT
  ========================= */
  function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* =========================
     VOICE INPUT
  ========================= */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };
  };

  /* =========================
     SEND MESSAGE
  ========================= */
  const sendMessage = async () => {
    if (!input.trim() || typing) return;

    const userText = input.trim();

    const userMessage = {
      sender: "user",
      text: userText,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const res = await api.post("/chat", {
        message: userText,
      });

      setTimeout(() => {
        const botMessage = {
          sender: "bot",
          text: res.data.reply || "No response 🤔",
          time: getCurrentTime(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setTyping(false);

        if (!open) {
          setUnread((prev) => prev + 1);
        }
      }, 700);
    } catch (error) {
      console.error("Chat error:", error);

      setTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Server error 😢",
          time: getCurrentTime(),
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="chat-toggle"
        onClick={() => {
          setOpen(!open);
          setUnread(0);
        }}
      >
        💬
        {!open && unread > 0 && (
          <span className="chat-badge">{unread}</span>
        )}
      </div>

      {open && (
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header">
            ERB Assistant 🤖
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          {/* Messages */}
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender}`}
              >
                <div>{msg.text}</div>
                <div className="chat-time">{msg.time}</div>
              </div>
            ))}

            {typing && (
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />

            <button onClick={startListening}>
              {listening ? "🎤..." : "🎙"}
            </button>

            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;