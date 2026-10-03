"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";

interface AskTutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol?: string;
}

export const AskTutorPanel: React.FC<AskTutorPanelProps> = ({
  isOpen,
  onClose,
  stockSymbol,
}) => {
  const pathname = usePathname();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Ayubowan! I am your CSE Mastery AI Tutor. Ask me anything about CSE stock mechanics, 1.12% fee calculations, position sizing, support/resistance, or today's market action.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "How does the 1.12% CSE fee affect my break-even price?",
    "How should I size a trade with a 2% risk limit?",
    "Explain the difference between ASPI and S&P SL20.",
    "What happens on an Ex-Dividend (XD) date?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          currentPage: pathname,
          symbol: stockSymbol,
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages([...newMessages, { role: "assistant", text: data.response }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            text: "On the Colombo Stock Exchange, risk management is paramount. Ensure you maintain stop-losses and account for 1.12% single-leg transaction fees.",
          },
        ]);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: "I'm currently running in offline curriculum mode. Feel free to ask about CSE fee math, support/resistance, T-Bill benchmarks, or position sizing.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              CSE AI Tutor
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30">
                LKR Context
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              {stockSymbol ? `Discussing ${stockSymbol}` : "Ask anything about CSE"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2.5 leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-emerald-600 text-white font-medium"
                  : "bg-slate-800/90 text-slate-200 border border-slate-700/60"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>AI Tutor is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {quickQuestions.slice(0, 2).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Tutor about CSE trading..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
