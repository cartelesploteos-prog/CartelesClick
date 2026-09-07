import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Calculator,
  ArrowRight,
  PhoneCall,
  Zap,
  CheckCircle2,
  Clock,
  Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: string;
    label: string;
    view: string;
    param?: string;
  } | null;
  detectedQuote?: {
    materialName: string;
    widthCm: number;
    heightCm: number;
    quantity: number;
    estimatedTotalARS: number;
  } | null;
}

interface LiveChatSupportProps {
  onNavigate: (view: string, param?: string) => void;
  currentView?: string;
}

const QUICK_PROMPTS = [
  { label: "🏷️ Cotizar Lona 3×2m", prompt: "¿Cuánto cuesta una lona frontlight de 3x2 metros con ojales?" },
  { label: "💡 Lona Front vs Backlight", prompt: "¿Cuál es la diferencia entre lona frontlight y backlight?" },
  { label: "📐 Resolución / DPI", prompt: "¿Qué resolución en DPI necesito para un cartel en vía pública?" },
  { label: "🚚 Tiempos de Entrega", prompt: "¿Cuánto demoran en fabricar y despachar un pedido?" },
  { label: "🧱 Rígidos y Placas", prompt: "¿Cómo se cotizan las placas de PVC y corrugado?" }
];

export const LiveChatSupport: React.FC<LiveChatSupportProps> = ({
  onNavigate,
  currentView = "home"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      text: "¡Hola! Soy **Sofi**, tu asesora técnica en vivo de **Carteles.Click** ⚡\n\nPuedo ayudarte a **cotizar al instante**, elegir el material adecuado para tu proyecto (lonas, vinilos, rígidos), o resolver dudas de resolución y producción.\n\n¿En qué tipo de cartel o trabajo estás pensando?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedAction: {
        type: "navigate",
        label: "Explorar Cotizador Vivo",
        view: "cotizador"
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-live-chat", handleOpenChat);
    return () => window.removeEventListener("open-live-chat", handleOpenChat);
  }, []);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage("");
    setIsLoading(true);

    try {
      // Build history for API
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        text: m.text
      }));

      const res = await fetch("/api/chat/live-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          currentView
        })
      });

      if (!res.ok) throw new Error("Error en respuesta del servidor");

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.reply || "¡Disculpá! No pude procesar esa consulta. ¿Querés que te transfiera con un técnico?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data.suggestedAction || null,
        detectedQuote: data.detectedQuote || null
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error enviando mensaje al chat en vivo:", err);
      const fallbackMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        text: "¡Hola! En este momento estoy actualizando la lista de materiales. Podés cotizar en tiempo real con nuestro calculador en vivo.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: {
          type: "navigate",
          label: "Ir al Cotizador Instantáneo",
          view: "cotizador"
        }
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: "assistant",
        text: "¡Chat reiniciado! Soy **Sofi**, tu asesora de taller. ¿En qué te puedo asesorar ahora?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* FLOATING CHAT TRIGGER BUTTON */}
      <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10 }}
              className="relative group"
            >
              {/* Tooltip badge */}
              <div className="absolute right-0 bottom-full mb-2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Asistencia en Vivo & Cotizaciones</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[var(--brand-brick)] hover:bg-[#FF6B38] text-white font-bold shadow-2xl shadow-[var(--brand-brick)]/40 transition-all cursor-pointer border border-white/20"
                aria-label="Abrir Chat de Soporte en Vivo"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    💬
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--brand-brick)] animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--brand-brick)]" />
                </div>

                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-black tracking-wide leading-tight">ATENCIÓN EN VIVO</span>
                  <span className="text-[10px] opacity-90 font-medium">Asesora de Taller Sofi</span>
                </div>

                {unreadCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-white text-[var(--brand-brick)] text-xs font-black flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHAT DRAWER / POPOVER PANEL */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-[calc(100svw-2rem)] sm:w-[420px] max-h-[85svh] h-[580px] flex flex-col rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] shadow-2xl overflow-hidden backdrop-blur-2xl z-50 text-[var(--text-primary)]"
            >
              {/* CHAT HEADER */}
              <div className="px-4 py-3.5 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--brand-brick)] to-[#FF8855] flex items-center justify-center text-white font-bold shadow-md shadow-[var(--brand-brick)]/20">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-surface-elevated)]" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                        Sofi — Taller Carteles.Click
                      </h3>
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--brand-brick)]/10 border border-[var(--brand-brick)]/30 text-[var(--brand-brick)] text-[9px] font-black uppercase">
                        AI TALLER
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      <span>En línea | Respuestas técnicas en segundos</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearHistory}
                    title="Reiniciar chat"
                    className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Cerrar chat"
                    className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* QUICK PROMPTS SCROLL BAR */}
              <div className="p-2.5 bg-[var(--bg-surface-subtle)]/50 border-b border-[var(--border-subtle)] overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.prompt)}
                    className="px-2.5 py-1 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--brand-brick)]/15 border border-[var(--border-subtle)] hover:border-[var(--brand-brick)]/40 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <span>{qp.label}</span>
                  </button>
                ))}
              </div>

              {/* MESSAGES CONTAINER */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[var(--text-muted)] font-medium">
                      <span>{msg.role === "user" ? "Vos" : "Sofi (Taller)"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--brand-brick)] text-white rounded-tr-none shadow-md shadow-[var(--brand-brick)]/15"
                          : "bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none"
                      }`}
                    >
                      <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-2">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>

                      {/* DETECTED QUOTE CARD INTEGRATION */}
                      {msg.detectedQuote && (
                        <div className="mt-3 p-3 rounded-xl bg-black/10 dark:bg-white/5 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                            <span className="flex items-center gap-1">
                              <Calculator className="w-3.5 h-3.5" />
                              <span>Cotización Estimada Taller</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] uppercase">
                              En Vivo
                            </span>
                          </div>

                          <div className="text-xs space-y-1 text-[var(--text-primary)]">
                            <p className="font-semibold">{msg.detectedQuote.materialName}</p>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              Medida: {msg.detectedQuote.widthCm} × {msg.detectedQuote.heightCm} cm ({msg.detectedQuote.quantity} un.)
                            </p>
                            <p className="text-sm font-black text-[var(--brand-brick)] pt-1">
                              ${msg.detectedQuote.estimatedTotalARS.toLocaleString("es-AR")} ARS
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onNavigate("cotizador");
                            }}
                            className="w-full mt-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <span>Ir al Cotizador y Confirmar Pedido</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* SUGGESTED ACTION CTA BUTTON */}
                      {msg.suggestedAction && !msg.detectedQuote && (
                        <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onNavigate(
                                msg.suggestedAction!.view,
                                msg.suggestedAction!.param
                              );
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-[var(--brand-brick)] hover:bg-[#FF6B38] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                          >
                            <span>{msg.suggestedAction.label}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] w-fit text-xs text-[var(--text-secondary)]">
                    <Bot className="w-4 h-4 text-[var(--brand-brick)] animate-bounce" />
                    <span className="font-medium animate-pulse">Sofi está consultando stock y precios en taller...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* WHATSAPP & DIRECT CALL DIRECT LINK */}
              <div className="px-3 py-1.5 bg-[var(--bg-surface-subtle)]/80 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Despacho express a todo el país</span>
                </span>
                <a
                  href="https://wa.me/5491138880000?text=Hola%20Carteles.Click%2C%20necesito%20asesoramiento%20para%20un%20trabajo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:underline font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>WhatsApp Directo Taller</span>
                </a>
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[var(--bg-surface-elevated)] border-t border-[var(--border-subtle)] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribí tu consulta o medida a cotizar..."
                  className="flex-1 px-3.5 py-2.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--brand-brick)] focus:outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-[var(--brand-brick)] hover:bg-[#FF6B38] disabled:opacity-40 disabled:hover:bg-[var(--brand-brick)] text-white flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
