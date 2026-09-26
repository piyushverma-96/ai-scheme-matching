import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { askSchemeQuestion } from '../api';

export default function AiAssistantModal() {
  const { t, i18n } = useTranslation();
  const { aiAssistantOpen, setAiAssistantOpen, startWizard } = useApp();
  
  const isHi = i18n.language === 'hi';

  const defaultWelcome = isHi
    ? 'नमस्ते! मैं आपका UdyamNex सहायक हूँ। मैं आपको सरकारी योजनाओं की खोज, आवश्यक दस्तावेजों को समझने, ऋण ईएमआई की गणना करने या निकटतम पार्टनर एजेंसियों को खोजने में मदद कर सकता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?'
    : 'Namaste! I am your UdyamNex Sahayak. I can help you find government schemes, understand required documents, calculate loan EMIs, or locate channelizing agencies. How can I assist you today?';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: defaultWelcome,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    t('ai_modal.suggestion_1', 'What schemes are available for SC entrepreneurs?'),
    t('ai_modal.suggestion_2', 'What documents are required for an education loan?'),
    t('ai_modal.suggestion_3', 'How does NSFDC interest subvention work?'),
    t('ai_modal.suggestion_4', 'Where can I find the nearest partner agency?'),
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const resp = await askSchemeQuestion({
        question: query,
        language: isHi ? 'hindi' : 'english',
      });
      if (resp?.data?.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: resp.data.answer,
            sources: resp.data.sources || [],
          },
        ]);
      } else {
        throw new Error('No answer returned from AI service');
      }
    } catch (err) {
      console.warn('Live AI response note, using grounded assistance:', err);
      let fallbackReply = isHi
        ? 'मैं आपका मार्गदर्शन कर सकता हूँ! सभी NSFDC योजनाएं SC लाभार्थियों के लिए 90% तक परियोजना वित्तपोषण के साथ 4% से 8% प्रति वर्ष की रियायती ब्याज दरें प्रदान करती हैं।'
        : 'All verified NSFDC schemes offer concessional interest rates between 4% and 8% p.a. with up to 90% project financing for SC beneficiaries.';
      const q = query.toLowerCase();

      if (q.includes('eligib') || q.includes('check') || q.includes('पात्रता') || q.includes('जांच')) {
        fallbackReply = isHi
          ? 'अपनी पात्रता जांचने के लिए, 6-चरणीय पात्रता प्रक्रिया शुरू करें। अपनी परियोजना का प्रकार, अनुमानित लागत और वार्षिक पारिवारिक आय प्रदान करें।'
          : "To check your eligibility, start the 6-step journey to evaluate your criteria against verified NSFDC schemes in seconds.";
      } else if (q.includes('women') || q.includes('mahila') || q.includes('महिला')) {
        fallbackReply = isHi
          ? 'अनुसूचित जाति की महिला उद्यमियों के लिए, महिला समृद्धि योजना (MSY) केवल 4% प्रति वर्ष की रियायती ब्याज दर और 100% वित्तपोषण के साथ ₹1,40,000 तक का सूक्ष्म ऋण प्रदान करती है!'
          : "For SC women entrepreneurs, the Mahila Samriddhi Yojana (MSY) provides micro-loans up to ₹1,40,000 at a subsidized interest rate of just 4% p.a. with 100% project financing!";
      } else if (q.includes('document') || q.includes('paper') || q.includes('दस्तावेज') || q.includes('कागजात')) {
        fallbackReply = isHi
          ? 'मानक आवश्यक दस्तावेजों में शामिल हैं: (1) वैध जाति प्रमाण पत्र, (2) आय प्रमाण पत्र / स्व-घोषणा, (3) आधार कार्ड, (4) परियोजना रिपोर्ट / प्रवेश पत्र, और (5) बैंक पासबुक।'
          : "Standard required documents include: (1) Valid Caste Certificate, (2) Income Certificate / Self-Declaration, (3) Aadhaar Card, (4) Project Report / Fee Structure, and (5) Bank Passbook.";
      } else if (q.includes('partner') || q.includes('near') || q.includes('पार्टनर') || q.includes('बैंक')) {
        fallbackReply = isHi
          ? 'चैनल पार्टनर एजेंसियां (राज्य SC वित्त निगम, सार्वजनिक क्षेत्र के बैंक, क्षेत्रीय ग्रामीण बैंक) स्थानीय स्तर पर आवेदनों को संसाधित करती हैं। उन्हें मानचित्र पर देखने के लिए "पार्टनर खोजें" का उपयोग करें!'
          : "Channelizing agencies (State SC Finance Corporations, Public Sector Banks, Regional Rural Banks) process applications locally. Use our Partner Locator on the sidebar to view them on a live map!";
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button on desktop only (on mobile, trigger is cleanly integrated in BottomNav) */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="flex items-center gap-2.5 bg-white hover:bg-[#F7F9FB] text-[#0B3B60] border border-[#CBD5E1] px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer font-semibold text-xs sm:text-sm group min-h-[44px]"
          aria-label="Open AI Help Assistant"
        >
          <div className="w-7 h-7 rounded-xl bg-[#E8F8F2] group-hover:bg-[#0E6655] group-hover:text-white transition-colors flex items-center justify-center text-[#0E6655]">
            <Bot className="w-4 h-4" />
          </div>
          <span>{t('nav.ai', 'Ask UdyamNex')}</span>
        </button>
      </div>

      {/* Assistant Modal Window */}
      {aiAssistantOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity animate-in fade-in"
            onClick={() => setAiAssistantOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[380px] max-w-[400px] mx-auto sm:mx-0 h-[min(520px,calc(100vh-140px))] bg-white rounded-3xl shadow-2xl border border-[#CBD5E1] z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#0B3B60] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#E59310]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">{t('ai_modal.title', 'UdyamNex Assistant')}</h4>
                <p className="text-[10px] text-blue-200">MoSJE Scheme Advisory</p>
              </div>
            </div>
            <button
              onClick={() => setAiAssistantOpen(false)}
              className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F7F9FB] text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#0B3B60] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#0B3B60] text-white rounded-br-none'
                      : 'bg-white text-[#1C1C1C] border border-[#E5E7EB] rounded-bl-none shadow-2xs'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#E5E7EB] space-y-1">
                      <span className="text-[10px] font-bold text-[#64748B] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                        {t('ai_modal.verified_source', 'Verified NSFDC Source')}:
                      </span>
                      {m.sources.slice(0, 2).map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.source_url || 'https://nsfdc.nic.in/scheme'}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[10px] text-[#2563EB] hover:underline truncate"
                        >
                          {src.source_name || 'NSFDC Official Scheme Guidelines'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-[#0B3B60] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B3B60]" />
                  <span>{t('ai_modal.thinking', 'UdyamNex AI is typing...')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="p-2 bg-white border-t border-[#E5E7EB] flex gap-1.5 overflow-x-auto">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap text-[10px] font-medium bg-[#F7F9FB] hover:bg-[#EAF1F6] text-[#0B3B60] px-2.5 py-1 rounded-full border border-[#E5E7EB] transition-base shrink-0 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-[#E5E7EB] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai_modal.placeholder', 'Ask anything about schemes...')}
              className="flex-1 h-9 px-3 border border-[#E5E7EB] rounded-lg text-xs outline-none focus:border-[#0B3B60]"
            />
            <button
              type="submit"
              className="w-9 h-9 bg-[#0B3B60] hover:bg-[#07263F] text-white rounded-lg flex items-center justify-center cursor-pointer transition-base shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </>
    )}
  </>
);
}
