import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Wrench, Sparkles } from 'lucide-react'
import mockApi from '../services/mockApi'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await mockApi.sendChatMessage(input)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Unable to process request. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    "What are the most common device failures?",
    "Why do batteries swell?",
    "Show me failure patterns across devices",
    "What design improvements can prevent failures?"
  ]

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg">
            <Wrench size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-heading">AI Repair Expert</h1>
            <p className="text-sm text-slate-400">Ask questions about device failures and repair patterns</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block p-4 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full mb-4">
              <Bot size={48} className="text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome to FaultMatrix AI</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              I'm your AI repair assistant, trained on 1,109 repair guides and 6,765 failure patterns. 
              Ask me anything about device failures, root causes, or repair recommendations!
            </p>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-sm text-slate-500 mb-4 font-semibold">Try asking:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="text-left p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-orange-500/50 rounded-lg transition-all group"
                  >
                    <Sparkles size={16} className="inline mr-2 text-orange-400" />
                    <span className="text-slate-300 group-hover:text-orange-400 transition-colors">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 mr-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg">
                  <Wrench size={20} className="text-white" />
                </div>
              </div>
            )}
            <div className={`${msg.role === 'user' ? 'chat-user' : 'chat-assistant'} max-w-3xl`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <User size={20} className="text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex-shrink-0 mr-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg">
                <Wrench size={20} className="text-white" />
              </div>
            </div>
            <div className="chat-assistant">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about device failures, repair patterns, or root causes..."
              className="search-bar flex-1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Powered by AI analysis of 1,109 repair guides - Demo mode
          </p>
        </div>
      </div>
    </div>
  )
}