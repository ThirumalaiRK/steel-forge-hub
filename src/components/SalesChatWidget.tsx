import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Phone, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SalesChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ id: number, text: string, sender: 'user' | 'bot' | 'agent' }[]>([
        { id: 1, text: "Hello! I'm AiRS Bot. Looking for a quote or technical specs?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newUserMsg = { id: Date.now(), text: inputValue, sender: 'user' as const };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate Bot Response
        setTimeout(() => {
            let botResponse = "That's a great question. Let me connect you with a Sales Engineer.";

            const lowerInput = newUserMsg.text.toLowerCase();
            if (lowerInput.includes("price") || lowerInput.includes("quote")) {
                botResponse = "For accurate pricing, try our Instant AI Quote tool or Configurator. Would you like the links?";
            } else if (lowerInput.includes("support") || lowerInput.includes("help")) {
                botResponse = "Our support team is available 24/7. Please email support@airs-solutions.com for urgent tickets.";
            } else if (lowerInput.includes("human") || lowerInput.includes("agent")) {
                botResponse = "Connecting you to a specialist... (Just kidding, this is a demo!)";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    className="h-16 w-16 rounded-full shadow-2xl bg-brand-orange hover:bg-orange-600 transition-transform hover:scale-105 flex items-center justify-center"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageSquare size={32} className="text-white" />
                    {/* Notification Dot */}
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] md:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">AiRS Sales Support</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Bot size={10} /> Automated Asistant
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
                    <X size={20} />
                </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-slate-50">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                    ? 'bg-brand-orange text-white rounded-tr-none'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                    <Input
                        placeholder="Type your message..."
                        className="flex-1"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <Button size="icon" className="bg-slate-900 hover:bg-slate-800" onClick={handleSend}>
                        <Send size={18} />
                    </Button>
                </div>
                <div className="flex justify-center mt-2 gap-4">
                    <button className="text-[10px] text-slate-400 hover:text-brand-orange flex items-center gap-1 uppercase font-bold tracking-wider">
                        <Headset size={10} /> Call Engineering
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesChatWidget;
