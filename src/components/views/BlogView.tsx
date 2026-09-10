import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Share2,
  Calendar,
  User,
  Plus
} from "lucide-react";
import Markdown from "react-markdown";
import { BlogPost } from "../../types";
import { FALLBACK_ARTICLES } from "../../data/blog";

interface BlogViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<BlogPost[]>(FALLBACK_ARTICLES);
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();
        if (data && data.posts && data.posts.length > 0) {
          setArticles(data.posts);
        }
      } catch (e) {
        console.error("Error al cargar blog:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-12 sm:space-y-16 font-sans">
      
      {/* ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <button
                onClick={() => setActiveArticle(null)}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al listado</span>
              </button>

              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
                {activeArticle.tag}
              </span>
            </div>

            <div className="space-y-4">
              <div className="h-64 rounded-xl overflow-hidden">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {activeArticle.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {activeArticle.readTime}
                </span>
                {activeArticle.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> {activeArticle.author}
                  </span>
                )}
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] font-bold leading-tight">
                {activeArticle.title}
              </h1>

              <div className="prose prose-sm prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed space-y-4 text-xs sm:text-sm font-sans pt-2 border-t border-[var(--border-subtle)]">
                <div className="markdown-body">
                  <Markdown>{activeArticle.content}</Markdown>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <button
                onClick={() => onNavigate("cotizador")}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
              >
                Cotizar este Sustrato Ahora
              </button>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-widest text-primary font-heading font-medium">
            Publicaciones Técnicas & Guías de Taller
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight font-normal">
            {t("blog_title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
            {t("blog_subtitle")}
          </p>
        </div>

        <button
          onClick={() => onNavigate("admin")}
          className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 transition-colors self-start md:self-auto shadow-none cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>Gestionar en CMS Admin</span>
        </button>
      </div>

      {/* ARTICLES GRID (ADAPTIVE BENTO GRID ON XL+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {articles.map((art) => (
          <article
            key={art.id}
            className="rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-none hover:border-primary transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative bg-[var(--bg-surface-subtle)] cursor-pointer" onClick={() => setActiveArticle(art)}>
                <img
                  src={art.image}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-[7px] bg-black/80 text-white font-sans">
                  {art.tag}
                </span>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] font-sans">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {art.readTime}
                  </span>
                  <span>•</span>
                  <span>{art.date}</span>
                </div>
                <h3
                  onClick={() => setActiveArticle(art)}
                  className="font-heading text-base text-[var(--text-primary)] leading-snug font-medium hover:text-primary cursor-pointer transition-colors"
                >
                  {art.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans font-normal line-clamp-3">
                  {art.excerpt}
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setActiveArticle(art)}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-sans font-medium"
              >
                <span>Leer guía completa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
