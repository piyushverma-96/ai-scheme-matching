import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AI_QUICK_PROMPTS, AI_KNOWLEDGE_RESPONSES } from '../data/mockData';

export default function AiAssistantView() {
  const { navigateTo, user, profile } = useApp();
  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || '';
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Namaste${userName ? ' ' + userName : ''}! I am your ArthSetu Guidance Assistant. How can I help you today with government schemes, eligibility, or partner locations?`,
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (textToSend) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      let reply =
        'All listed schemes provide concessional interest rates (4%–8% p.a.) with up to 90% project financing for eligible beneficiaries.';
      const lower = q.toLowerCase();

      if (lower.includes('suit') || lower.includes('which') || lower.includes('scheme')) {
        reply = AI_KNOWLEDGE_RESPONSES.suit;
      } else if (lower.includes('document') || lower.includes('paper') || lower.includes('need')) {
        reply = AI_KNOWLEDGE_RESPONSES.docs;
      } else if (lower.includes('emi') || lower.includes('calculat') || lower.includes('repay')) {
        reply = AI_KNOWLEDGE_RESPONSES.emi;
      } else if (lower.includes('partner') || lower.includes('where') || lower.includes('branch') || lower.includes('find')) {
        reply = AI_KNOWLEDGE_RESPONSES.partner;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 400);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col h-[580px]">
        {/* Header */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B3B60]">
              ArthSetu Assistant
            </h3>
            <p className="text-[10px] text-[#64748B]">
              Guidance on government loan schemes
            </p>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#FAFBFD]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#0B3B60] text-white flex items-center justify-center shrink-0 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#0B3B60] text-white rounded-br-xs'
                    : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-xs shadow-2xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Prompts */}
        <div className="p-2.5 bg-white border-t border-[#E2E8F0] flex gap-2 overflow-x-auto">
          {AI_QUICK_PROMPTS.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#EFF6FF] text-[#0B3B60] text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about schemes..."
            className="flex-1 h-10 px-4 rounded-xl border border-[#E2E8F0] text-xs outline-none focus:border-[#0B3B60]"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
