"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem("image-generation-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // 保存历史记录
  const saveToHistory = (item: HistoryItem) => {
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("image-generation-history", JSON.stringify(newHistory));
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setCurrentImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setCurrentImage(data.imageUrl);

      // 保存到历史记录
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        prompt,
        imageUrl: data.imageUrl,
        timestamp: Date.now(),
      };
      saveToHistory(newItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // 如果跨域下载失败，尝试新窗口打开
      window.open(imageUrl, "_blank");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("image-generation-history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-stone-900/70 border-b border-amber-200/50 dark:border-stone-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 dark:from-amber-400 dark:to-rose-400 bg-clip-text text-transparent"
          >
            元宝创作
          </Link>
          <Link
            href="/"
            className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-3">
            AI 图像生成
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            输入描述，让 AI 为你创作独特图像
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-6 border border-amber-100 dark:border-stone-700">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                图像描述
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的图像，例如：一只可爱的橘猫在阳光下打盹..."
                className="w-full h-40 p-4 rounded-xl border border-amber-200 dark:border-stone-600 bg-amber-50/50 dark:bg-stone-900/50 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 resize-none"
              />
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full mt-4 py-3 px-6 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:from-stone-300 disabled:to-stone-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    生成中...
                  </span>
                ) : (
                  "生成图像"
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* 示例提示词 */}
            <div className="bg-white/50 dark:bg-stone-800/50 rounded-xl p-4 border border-amber-100 dark:border-stone-700">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                示例提示词
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Sunset over mountains",
                  "Cute orange cat",
                  "Futuristic city",
                  "Abstract art",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="px-3 py-1 text-sm bg-amber-100 dark:bg-stone-700 text-amber-700 dark:text-amber-300 rounded-full hover:bg-amber-200 dark:hover:bg-stone-600 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：输出区域 */}
          <div className="space-y-6">
            {/* 当前图像 */}
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-6 border border-amber-100 dark:border-stone-700 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-stone-700 dark:text-stone-300">
                  生成结果
                </h2>
                {currentImage && (
                  <button
                    onClick={() =>
                      downloadImage(currentImage, `generated-${Date.now()}.png`)
                    }
                    className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    下载
                  </button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center bg-stone-100 dark:bg-stone-900 rounded-xl overflow-hidden">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 text-stone-400">
                    <svg
                      className="animate-spin h-12 w-12"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p>AI 正在创作中...</p>
                  </div>
                ) : currentImage ? (
                  <img
                    src={currentImage}
                    alt="Generated"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-stone-400 text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-3 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p>生成的图像将显示在这里</p>
                  </div>
                )}
              </div>
            </div>

            {/* 历史记录 */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-6 border border-amber-100 dark:border-stone-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-stone-700 dark:text-stone-300">
                    历史记录
                  </h2>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-stone-500 hover:text-red-500 transition-colors"
                  >
                    清空
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-900 cursor-pointer"
                      onClick={() => setCurrentImage(item.imageUrl)}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(
                              item.imageUrl,
                              `generated-${item.timestamp}.png`
                            );
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full transition-opacity"
                        >
                          <svg
                            className="w-4 h-4 text-stone-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
