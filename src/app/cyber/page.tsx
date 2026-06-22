"use client";

import { useEffect, useRef, useState } from "react";

export default function CyberPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const sections = ["hero", "materials", "exoskeleton", "specs"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced particle canvas effect - black and gold
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }

    const particles: Particle[] = [];
    const goldColors = ["#D4AF37", "#F4E4BA", "#C9A227"];

    for (let i = 0; i < 60; i++) {
      const isGold = Math.random() > 0.4;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        color: isGold ? goldColors[Math.floor(Math.random() * goldColors.length)] : "#1A1A1A",
        alpha: Math.random() * 0.4 + 0.15,
      });
    }

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    let frame = 0;
    const animate = () => {
      ctx.fillStyle = "rgba(13, 13, 13, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;
      particles.forEach((p, i) => {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.015;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.x < 0) { p.x = 0; p.vx *= -0.7; }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -0.7; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.7; }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -0.7; }

        if (p.color !== "#1A1A1A") {
          p.alpha = 0.25 + Math.sin(frame * 0.03 + i) * 0.15;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        if (p.color === "#D4AF37" || p.color === "#F4E4BA") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.12;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#0D0D0D] text-white min-h-screen overflow-x-hidden relative">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-12 py-6 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#D4AF37]/15">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollToSection("hero")}>
            <div className="w-10 h-10 border border-[#D4AF37]/60 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-all duration-300">
              <span className="text-[#D4AF37] font-bold text-sm tracking-wider">CY</span>
            </div>
            <span className="text-xs tracking-[0.3em] text-[#D4AF37]/80 font-light">CYBERVERSE</span>
          </div>
          <div className="flex items-center gap-12 text-[10px] tracking-[0.25em]">
            {[
              { id: "hero", label: "HOME" },
              { id: "materials", label: "MATERIALS" },
              { id: "exoskeleton", label: "SYSTEM" },
              { id: "specs", label: "SPECS" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`transition-all duration-300 ${
                  activeSection === item.id ? "text-[#D4AF37]" : "text-[#777] hover:text-[#D4AF37]/70"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-4xl relative z-10">
          <div className="mb-10">
            <span className="inline-block px-5 py-2 border border-[#D4AF37]/25 text-[#D4AF37]/80 text-[9px] tracking-[0.5em]">
              NEXT GENERATION HUMAN
            </span>
          </div>

          <h1 className="text-7xl md:text-[100px] lg:text-[140px] font-bold mb-12 tracking-tight leading-none">
            <span className="bg-gradient-to-r from-[#F4E4BA] via-[#D4AF37] to-[#C9A227] bg-clip-text text-transparent">
              CYBER
            </span>
            <br />
            <span className="text-white">HUMAN</span>
          </h1>

          <p className="text-[#888] text-lg md:text-xl max-w-lg mx-auto mb-16 font-light leading-relaxed">
            高端工业科幻 · 优雅超人类主义
            <br />
            <span className="text-[#D4AF37]/50 text-sm">Advanced Industrial Sci-Fi · Elegant Transhumanism</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => scrollToSection("materials")}
              className="px-12 py-4 bg-[#D4AF37] text-black text-xs font-semibold tracking-[0.25em] hover:bg-[#F4E4BA] transition-all duration-300"
            >
              ENTER
            </button>
            <button
              onClick={() => scrollToSection("exoskeleton")}
              className="px-12 py-4 border border-[#D4AF37]/30 text-[#D4AF37]/80 text-xs tracking-[0.25em] hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              LEARN MORE
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <span className="text-[#555] text-[9px] tracking-[0.4em]">SCROLL</span>
          <div className="w-[1px] h-14 bg-gradient-to-b from-[#D4AF37]/60 to-transparent relative overflow-hidden">
            <div className="w-full h-4 bg-[#D4AF37] absolute top-0 animate-scroll-line" />
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section id="materials" className="relative py-48 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-32">
            <span className="text-[#D4AF37]/70 text-[10px] tracking-[0.5em] mb-8 block">MATERIALS</span>
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">材料构成</h2>
            <p className="text-[#777] font-light max-w-md mx-auto text-sm leading-relaxed">
              锻造哑光碳纤维缎面与航空航天级合金
            </p>
          </div>

          {/* Material cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "碳纤维",
                subtitle: "CARBON FIBER",
                specs: ["CF-200 Series", "航空级编织工艺", "10.5mm厚度", "高强度轻量化"],
              },
              {
                title: "钛合金",
                subtitle: "TITANIUM ALLOY",
                specs: ["Ti-6Al-4V 级", "精密加工技术", "军用级强度", "耐腐蚀特性"],
              },
              {
                title: "陶瓷复合",
                subtitle: "CERAMIC COMPOSITE",
                specs: ["石墨陶瓷基底", "阳极氧化处理", "耐高温特性", "超硬表面"],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group p-10 border border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#D4AF37]/40 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="text-[#D4AF37]/60 text-[9px] tracking-[0.35em] mb-5">{item.subtitle}</div>
                <h3 className="text-3xl font-bold text-white mb-10 tracking-tight">{item.title}</h3>
                <div className="space-y-5">
                  {item.specs.map((spec, j) => (
                    <div key={j} className="flex items-center gap-4 text-[#888] text-sm">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37]/50 rounded-full" />
                      <span className="font-light">{spec}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Color palette */}
          <div className="mt-36">
            <div className="text-center text-[#666] text-[9px] tracking-[0.5em] mb-12">COLOR PALETTE</div>
            <div className="flex justify-center gap-10 flex-wrap">
              {[
                { name: "石墨黑", color: "#1A1A1A", border: "#333" },
                { name: "炭黑", color: "#0D0D0D", border: "#D4AF37" },
                { name: "枪灰", color: "#2A2A2A", border: "#666" },
                { name: "钛金", color: "#3A3A3A", border: "#D4AF37" },
                { name: "琥珀", color: "#C9A227", border: "#C9A227" },
                { name: "象牙", color: "#F4E4BA", border: "#F4E4BA" },
              ].map((c, i) => (
                <div key={i} className="text-center group cursor-pointer">
                  <div
                    className="w-16 h-16 border mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: c.color,
                      borderColor: c.border + "50",
                      boxShadow: (c.color === "#D4AF37" || c.color === "#F4E4BA") ? `0 0 25px ${c.color}30` : "none",
                    }}
                  />
                  <span className="text-[#555] text-[10px] tracking-wider group-hover:text-[#D4AF37]/70 transition-colors">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Exoskeleton Section */}
      <section id="exoskeleton" className="relative py-48 px-8 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-32">
            <span className="text-[#D4AF37]/70 text-[10px] tracking-[0.5em] mb-8 block">EXOSKELETON</span>
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">赛博性能战衣</h2>
            <p className="text-[#777] font-light max-w-md mx-auto text-sm leading-relaxed">
              部分工程化设计 · 整合碳纤维结构板与分段钛合金支撑板
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { num: "01", title: "碳纤维结构板", desc: "航空级编织碳纤维，10.5mm厚度，提供极致强度与轻量化" },
              { num: "02", title: "钛合金支撑", desc: "Ti-6Al-4V军用级钛合金，精密加工连接点" },
              { num: "03", title: "工程接缝", desc: "精密焊接技术，校准标记与制造邮票" },
              { num: "04", title: "序列号标识", desc: "每件作品唯一序列号，可追溯生产信息" },
              { num: "05", title: "嵌入式设计", desc: "身体改造嵌入服装，无牵挂设计" },
              { num: "06", title: "下一代人类", desc: "苹果工业设计遇见攻壳机动队" },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-[#0C0C0C] border border-[#222] p-12 hover:bg-[#111] hover:border-[#2A2A2A] transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-[#D4AF37] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 border border-[#D4AF37]/15 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/40 group-hover:bg-[#D4AF37]/5 transition-all duration-300">
                    <span className="text-[#D4AF37]/50 group-hover:text-[#D4AF37]/80 text-sm font-light transition-colors">{item.num}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">{item.title}</h3>
                    <p className="text-[#777] text-sm font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specs" className="relative py-48 px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-[#D4AF37]/70 text-[10px] tracking-[0.5em] mb-8 block">SPECIFICATIONS</span>
            <h2 className="text-6xl md:text-7xl font-bold text-white tracking-tight">技术规格</h2>
          </div>

          {/* Spec table */}
          <div className="border-t border-[#222]">
            {[
              { label: "材质", value: "锻造哑光碳纤维 / 枪金属钛合金 / 石墨陶瓷" },
              { label: "主色调", value: "深石墨黑 / 炭黑 / 枪灰 / 深钛" },
              { label: "点缀色", value: "柔和琥珀橙 / 温暖象牙 / 工业黄" },
              { label: "核心材料", value: "阳极氧化航空航天合金 / 陶瓷复合材料" },
              { label: "设计语言", value: "苹果工业设计 × 攻壳机动队" },
              { label: "哲学理念", value: "优雅超人类主义 · 高端工业科幻" },
            ].map((item, i) => (
              <div
                key={i}
                className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-12 py-8 border-b border-[#1A1A1A] hover:bg-[#0F0F0F]/50 px-6 -mx-6 transition-all duration-300"
              >
                <div className="w-40 shrink-0">
                  <span className="text-[#D4AF37]/60 text-[10px] tracking-[0.25em] group-hover:text-[#D4AF37] transition-colors">{item.label}</span>
                </div>
                <div className="text-[#999] text-sm font-light group-hover:text-[#CCC] transition-colors">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-[#151515]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 border border-[#D4AF37]/40 flex items-center justify-center">
                <span className="text-[#D4AF37] font-bold text-xs tracking-wider">CY</span>
              </div>
              <span className="text-[#555] text-xs tracking-[0.2em]">CYBERVERSE 2026</span>
            </div>
            <div className="flex gap-12 text-[#555] text-[10px] tracking-[0.2em]">
              <a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">PRIVACY</a>
              <a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">TERMS</a>
              <a href="#" className="hover:text-[#D4AF37] transition-colors duration-300">CONTACT</a>
            </div>
          </div>
          <div className="mt-20 text-center">
            <p className="text-[#333] text-[9px] tracking-[0.3em]">
              HIGH-END INDUSTRIAL SCI-FI · ELEGANT TRANSHUMANISM
            </p>
          </div>
        </div>
      </footer>

      {/* Global styles */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #0D0D0D;
          color: white;
        }

        ::selection {
          background: #D4AF37;
          color: black;
        }

        ::-webkit-scrollbar {
          width: 2px;
        }

        ::-webkit-scrollbar-track {
          background: #0D0D0D;
        }

        ::-webkit-scrollbar-thumb {
          background: #D4AF37;
        }

        @keyframes scroll-line {
          0% { top: -16px; }
          100% { top: 100%; }
        }

        .animate-scroll-line {
          animation: scroll-line 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
