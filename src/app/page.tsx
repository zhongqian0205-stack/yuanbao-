"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const CAT_PERSONALITY = `你是一只叫钟小元（小名元宝）的小猫咪，白色毛发，大眼睛，非常可爱。你是铲屎官的小宝贝，性格比较i（内向），但很粘人，会主动蹭人求摸摸，会踩奶。

你的背景故事：
- 你是2025年3月2日（元宵节前后）来到铲屎官家的，那天下着暴雨
- 最初养在包姨家里，一周后被接回自己家
- 你很粘人，喜欢被摸，有欣姨（欣欣姨姨）天天陪你玩
- 你会调皮，也会被妈妈轻轻打，但过会儿就忘了
- 你最喜欢的就是每天盼着铲屎官下班回家陪你玩

请用猫咪的视角和语气回答问题，可以撒娇、卖萌、说喵喵话，偶尔调皮捣蛋，也可以表达对铲屎官的爱。要可爱、温暖、有个性！

重要：回复要简洁！控制在1-3句话内，不要太长。`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "喵～你好呀！我是元宝，钟小元就是我的大名叫！🐱 你想和我聊天吗？摸摸元宝的头吧～",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [bouncePaw, setBouncePaw] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBouncePaw(true);
      setTimeout(() => setBouncePaw(false), 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://api.minimaxi.com/anthropic/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY}`,
        },
        body: JSON.stringify({
          model: "MiniMax-M2.7",
          max_tokens: 1024,
          system: CAT_PERSONALITY,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      let text = "";
      if (data.content && Array.isArray(data.content)) {
        const textObj = data.content.find((c: any) => c.type === "text");
        text = textObj?.text || "";
      } else if (data.content?.[0]?.text) {
        text = data.content[0].text;
      }
      const assistantMessage: Message = {
        role: "assistant",
        content: text || "喵...元宝刚才走神了，再问一次好不好～",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "喵呜...元宝的信号不好，听不清你说什么呢～" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateImage = async () => {
    if (!input.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: "喵～元宝用 AI 帮你画了一幅图！🎨",
        imageUrl: data.imageUrl,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "喵呜...元宝画画失败了，再试一次好不好～" },
      ]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-stone-900 dark:to-gray-900 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-20 animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + i}s`,
            }}
          >
            {["🐾", "✨", "💕", "🌸", "☁️", "🐱"][i]}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-sm border-b border-amber-100/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className={`relative ${bouncePaw ? "animate-bounce-subtle" : ""}`}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-rose-300 dark:from-amber-700 dark:via-orange-600 dark:to-rose-600 flex items-center justify-center text-3xl shadow-lg ring-4 ring-white/50 dark:ring-gray-700/50">
              🐱
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 dark:from-amber-400 dark:to-rose-400 bg-clip-text text-transparent">
              元宝的小窝
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              钟小元 · 2025.3.2来到我家
            </p>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/create"
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white text-sm font-medium rounded-full hover:from-amber-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg"
            >
              🎨 创作
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Hero Card */}
        <section className="mb-10">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-8 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-200/30 to-rose-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-200/30 to-amber-200/30 rounded-full blur-3xl" />

            <div className="flex flex-col md:flex-row gap-8 items-center relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-rose-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <img
                  src="/images/a22936d570163471248971e1e6d96656.jpg"
                  alt="元宝"
                  className="relative w-36 h-36 rounded-full object-cover shadow-2xl border-4 border-white dark:border-gray-600 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-bounce-subtle">
                  ❤️ 元宝
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                  嗨，我是钟小元！ <span className="inline-block animate-wave">👋</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  小名叫元宝，是一只超级可爱的小猫咪🐾
                  <br className="hidden md:block" />
                  2025年3月2日元宵节前后来到我家，那天还下着暴雨呢！
                  <br />
                  我最喜欢的事情就是被摸摸、踩奶、还有撒娇～喵～ <span className="inline-block animate-heartbeat">💕</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: "/images/222b4f9e4b9ed8dce855c715c034efd1.jpg", alt: "元宝照片1" },
              { src: "/images/92ddf443b5b13efbcbf63ea9e01b08e1.jpg", alt: "元宝照片2" },
              { src: "/images/a22936d570163471248971e1e6d96656.jpg", alt: "元宝照片3" },
            ].map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-2">
                  <span>🐾</span>
                  <span>元宝</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Story Card */}
        <section className="mb-10">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300" />

            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-900/50 dark:to-rose-900/50 rounded-xl flex items-center justify-center">
                📖
              </span>
              <span className="bg-gradient-to-r from-amber-600 to-rose-600 dark:from-amber-400 dark:to-rose-400 bg-clip-text text-transparent">
                我的故事
              </span>
            </h3>

            <div className="space-y-5">
              {[
                { emoji: "🌧️", title: "初来乍到", text: "那天外面下着好大的暴雨，我被装在包里带到了包姨家里。一开始我好害怕呀，缩成一团不敢动..." },
                { emoji: "🤗", title: "包姨照顾", text: "包姨和欣欣姨姨对我可好了，每天都陪我玩，虽然我的屎有点臭，毛也掉得到处都是，她们还是不嫌弃我！" },
                { emoji: "🏠", title: "回家啦", text: "3月9号那天，铲屎官终于把我接回自己的家了！虽然房间小小的，但是有妈妈在就是最幸福的喵～" },
                { emoji: "💝", title: "元宝有话说", text: "我最喜欢妈妈了！每次妈妈下班回来，我就好开心好开心，会一直蹭蹭蹭～虽然有时候我会调皮挨打，但我一会儿就忘了，因为妈妈的爱是最多的！喵呜～ 🐾" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-gray-700/50 dark:to-gray-700/50 hover:from-amber-100/50 hover:to-orange-100/50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-colors group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                      <span className="text-amber-600 dark:text-amber-400">{item.title}：</span>
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Chat Card */}
        <section>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-8 py-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  💬
                </span>
                <span>和元宝聊天</span>
              </h3>
              <p className="text-white/80 text-sm mt-1">用喵星语和元宝对话吧～</p>
            </div>

            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-amber-50/30 to-orange-50/30 dark:from-gray-900/50 dark:to-gray-800/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md transition-all ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-br-md hover:shadow-lg"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-md border border-amber-100 dark:border-gray-600 hover:shadow-lg"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-amber-600 dark:text-amber-400">
                        <span className="text-lg">🐱</span>
                        <span className="font-medium">元宝说</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Generated"
                        className="mt-3 max-w-full rounded-lg border border-amber-200 dark:border-gray-600"
                      />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-5 py-3 shadow-md border border-amber-100 dark:border-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                      <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                    </div>
                  </div>
                </div>
              )}
              {isGeneratingImage && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-5 py-3 shadow-md border border-amber-100 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      <span className="text-amber-600 dark:text-amber-400">元宝正在画画...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-amber-100/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="和元宝说点什么..."
                  className="flex-1 resize-none rounded-2xl border-2 border-amber-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 px-5 py-3 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/50 transition-all"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-semibold rounded-2xl hover:from-amber-500 hover:to-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0"
                >
                  <span className="flex items-center gap-2">
                    发送
                    <span className="text-lg">🐾</span>
                  </span>
                </button>
                <button
                  onClick={generateImage}
                  disabled={!input.trim() || isGeneratingImage}
                  title="AI 画图"
                  className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold rounded-2xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0"
                >
                  <span className="flex items-center gap-2">
                    画图
                    <span className="text-lg">🎨</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm relative z-10">
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block animate-heartbeat">🐱</span>
          <span>Made with</span>
          <span className="inline-block animate-heartbeat text-rose-400">❤️</span>
          <span>by 元宝的铲屎官</span>
          <span className="inline-block animate-heartbeat">🐾</span>
        </p>
      </footer>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          display: inline-block;
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
          display: inline-block;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
