import { useState, useRef } from 'react';
import { Send, Bot, User, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ConfidenceBadge from '../shared/ConfidenceBadge';
import { api, getAIResponseDirect } from '../../api/client';

const SUGGESTIONS = [
  'Why am I struggling with integration?',
  'What should I study first?',
  'Am I improving overall?',
  'Which topic has my best progress?',
];

const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY || '';

export default function StudentChat({ knowledgeMap, studentName }) {
  const initialMessage = {
    id: 1,
    role: 'ai',
    text: `Hi ${studentName || 'there'}! I'm your AI learning companion. I can see your progress across all your A-Math topics. What would you like to know?`,
    confidence: 'high',
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const lastAiMsgRef = useRef(null);

  const scrollChatToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const scrollToLastAiMsg = () => {
    lastAiMsgRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(scrollChatToBottom, 50);
    setTyping(true);

    try {
      let reply;
      try {
        const res = await api.sendChatMessage(text, knowledgeMap);
        reply = res?.message || res?.content || res?.reply || '*(No response received — please try again.)*';
      } catch {
        if (OPENAI_KEY) {
          reply = await getAIResponseDirect(text, knowledgeMap, OPENAI_KEY);
        } else {
          reply = generateFallbackReply(text, knowledgeMap);
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: `ai_${Date.now()}_${prev.length}`, role: 'ai', text: reply, confidence: 'medium' },
      ]);
      setTimeout(scrollToLastAiMsg, 50);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}_err`,
          role: 'ai',
          text: "Sorry, I couldn't connect right now. Please try again shortly.",
          confidence: 'low',
        },
      ]);
      setTimeout(scrollToLastAiMsg, 50);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
            <Bot size={14} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">AI Learning Companion</p>
            <p className="text-xs text-gray-400">Powered by your knowledge map</p>
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
          onClick={() => setMessages([{ ...initialMessage, id: Date.now() }])}
          title="Clear chat history"
        >
          <RotateCcw size={11} />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            ref={msg.role === 'ai' && idx === messages.length - 1 ? lastAiMsgRef : null}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`${msg.role === 'user' ? 'max-w-xs lg:max-w-sm order-2' : 'max-w-full order-1'}`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1 ml-1">
                  <Bot size={11} className="text-indigo-400" />
                  <span className="text-xs text-gray-400">AI</span>
                  {msg.confidence && <ConfidenceBadge level={msg.confidence} />}
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-x-auto ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                {msg.role === 'ai' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      code: ({ children }) => <code className="bg-gray-200 rounded px-1 font-mono text-xs">{children}</code>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex items-center gap-1 justify-end mt-1 mr-1">
                  <span className="text-xs text-gray-400">You</span>
                  <User size={11} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
              onClick={() => sendMessage(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 placeholder-gray-300"
            placeholder="Ask anything about your learning…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

function generateFallbackReply(message, knowledgeMap) {
  if (!knowledgeMap) {
    return "I don't have your learning data yet. Complete a quiz first and I'll give you personalised insights!";
  }

  const entries = Object.entries(knowledgeMap).map(([topic, data]) => ({ topic, ...data }));
  const sorted = [...entries].sort((a, b) => a.mastery_score - b.mastery_score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const regressing = entries.filter((e) => e.velocity === 'regressing');
  const improving = entries.filter((e) => e.velocity === 'improving');

  const msg = message.toLowerCase();

  if (msg.includes('struggl') || msg.includes('weak') || msg.includes('difficult')) {
    return `Based on your data, you're finding ${formatT(weakest.topic)} most challenging — you're at ${Math.round(weakest.mastery_score * 100)}% mastery${weakest.velocity === 'regressing' ? ' and it has been regressing lately' : ''}. I'd recommend spending focused time on this before your next quiz. Would you like some tips on how to approach it?`;
  }
  if (msg.includes('study first') || msg.includes('start') || msg.includes('priority')) {
    const regressingStr = regressing.length > 0
      ? `After that, work on ${regressing.slice(0, 2).map((e) => formatT(e.topic)).join(' and ')} since they're showing a downward trend. `
      : '';
    return `Your top priority should be ${formatT(weakest.topic)} (${Math.round(weakest.mastery_score * 100)}% mastery). ${regressingStr}Your strongest topic is ${formatT(strongest.topic)} at ${Math.round(strongest.mastery_score * 100)}% — maintain that!`;
  }
  if (msg.includes('improv') || msg.includes('progress') || msg.includes('better')) {
    return `You're improving in ${improving.length} topic(s): ${improving.map((e) => formatT(e.topic)).join(', ')}. ${regressing.length > 0 ? `However, ${regressing.map((e) => formatT(e.topic)).join(' and ')} need attention as they're regressing.` : 'Keep up the great work!'}`;
  }
  if (msg.includes('best') || msg.includes('strong')) {
    return `Your best topic is ${formatT(strongest.topic)} at ${Math.round(strongest.mastery_score * 100)}% mastery. Well done! Keep practising to maintain this level.`;
  }

  return `Looking at your knowledge map, your overall average mastery is ${Math.round(entries.reduce((s, e) => s + e.mastery_score, 0) / entries.length * 100)}%. You're currently improving in ${improving.length} topics and need to focus on ${weakest.topic.replace(/_/g, ' ')}. Ask me anything specific about your performance!`;
}

function formatT(t) {
  return t.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
