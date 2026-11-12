'use client';

import React from 'react';
import {
  Bot, Cpu, Layers, ShieldCheck, ArrowRight,
  Globe, Sparkles, Zap, Code2, Database, Phone
} from 'lucide-react';

interface LandingHeroProps {
  onOpenAssistant: () => void;
}

const metrics = [
  { value: '2004',   label: 'Established' },
  { value: '5,000+', label: 'Projects Delivered' },
  { value: '500+',   label: 'Global Engineers' },
  { value: '4',      label: 'Global Offices' },
];

const services = [
  { icon: Bot,        title: 'Artificial Intelligence & LLMs',    desc: 'Custom RAG pipelines, agentic workflows, fine-tuned LLMs, predictive analytics, and computer vision systems.' },
  { icon: Cpu,        title: 'Blockchain & Web3 Engineering',      desc: 'Smart contracts, Solidity/Rust audits, DeFi platforms, NFT infrastructure, and enterprise private ledgers.' },
  { icon: Layers,     title: 'Mobile & Enterprise Web',           desc: 'Native iOS & Android, Flutter cross-platform, Next.js 15 web apps, and cloud-native microservice architectures.' },
  { icon: Database,   title: 'Cloud & DevOps Infrastructure',     desc: 'AWS/GCP/Azure, Kubernetes, CI/CD automation, Infrastructure as Code — zero-downtime pipelines.' },
  { icon: Code2,      title: 'Full-Stack Engineering',             desc: 'Node.js, Python, Go backends with React/Vue frontends — from MVP to enterprise scale.' },
  { icon: ShieldCheck,title: 'Cybersecurity & Compliance',        desc: 'SOC 2, GDPR, penetration testing, secure SDLC, and end-to-end encryption implementations.' },
];

export function LandingHero({ onOpenAssistant }: LandingHeroProps) {
  return (
    <div className="space-y-20 py-12">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative text-center space-y-7 max-w-4xl mx-auto px-4">
        {/* Status pill */}
        <div
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-mono"
          style={{ background: 'var(--k-accent-soft)', border: '1px solid var(--k-accent-border)', color: 'var(--k-accent-text)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--k-online)', animation: 'pulseAurora 2.5s ease-in-out infinite' }} />
          <span>Mobiloitte Technologies · Enterprise AI & Digital Transformation</span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-[3.25rem] font-extrabold tracking-tight leading-[1.12]"
          style={{ color: 'var(--k-text)' }}
        >
          Accelerate Enterprise Innovation{' '}
          <br className="hidden sm:block" />
          with Intelligent AI &{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Software Engineering
          </span>
        </h1>

        <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--k-text-3)' }}>
          Over 20 years delivering 5,000+ digital applications across AI, Generative ML, Blockchain,
          Mobile Engineering, and Cloud-Native Infrastructures — globally.
        </p>

        {/* CTAs */}
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <button
            onClick={onOpenAssistant}
            className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold k-transition hover:opacity-88 active:scale-98"
            style={{
              background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 100%)',
              color: 'var(--k-bg)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Kaira AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#services"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold k-transition"
            style={{
              background: 'var(--k-surface)',
              border: '1px solid var(--k-border)',
              color: 'var(--k-text-2)',
              boxShadow: 'var(--k-shadow-sm)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--k-accent-border)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--k-text)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--k-border)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--k-text-2)';
            }}
          >
            <span>Explore Services</span>
          </a>
        </div>
      </section>

      {/* ── Metrics ──────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
        {metrics.map(({ value, label }) => (
          <div
            key={label}
            className="p-5 rounded-2xl text-center space-y-1.5 k-transition"
            style={{ background: 'var(--k-surface)', border: '1px solid var(--k-border)', boxShadow: 'var(--k-shadow-sm)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--k-accent-border)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--k-accent-soft)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--k-border)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--k-surface)';
            }}
          >
            <div
              className="text-3xl font-black font-mono"
              style={{
                background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {value}
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--k-text-3)' }}>
              {label}
            </div>
          </div>
        ))}
      </section>

      {/* ── Services Grid ─────────────────────────────────── */}
      <section id="services" className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <div
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest"
            style={{ background: 'var(--k-accent-soft)', border: '1px solid var(--k-accent-border)', color: 'var(--k-accent-text)' }}
          >
            <Zap className="w-3 h-3" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--k-text)' }}>
            Technology Verticals
          </h2>
          <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--k-text-3)' }}>
            Comprehensive digital engineering capabilities customised for startups to multinational enterprise operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl space-y-4 k-transition"
              style={{ background: 'var(--k-surface)', border: '1px solid var(--k-border)', boxShadow: 'var(--k-shadow-sm)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--k-accent-border)';
                (e.currentTarget as HTMLDivElement).style.background = 'var(--k-accent-soft)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--k-shadow-md)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--k-border)';
                (e.currentTarget as HTMLDivElement).style.background = 'var(--k-surface)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--k-shadow-sm)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--k-accent-soft)', color: 'var(--k-accent-text)' }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--k-text)' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--k-text-3)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section id="contact" className="max-w-5xl mx-auto px-4 pb-10">
        <div
          className="relative overflow-hidden p-8 md:p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: 'var(--k-accent-soft)',
            border: '1px solid var(--k-accent-border)',
            boxShadow: 'var(--k-shadow-lg)',
          }}
        >
          <div className="relative space-y-3 text-left">
            <div className="flex items-center space-x-2 text-xs font-mono" style={{ color: 'var(--k-accent-text)' }}>
              <Globe className="w-4 h-4" />
              <span>Worldwide Operations</span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--k-text)' }}>
              Need Enterprise Technology Consulting?
            </h3>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--k-text-3)' }}>
              Ask Kaira for instant answers about company credentials, tech stack, offices, or scheduling a consultation.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {['New Delhi', 'Jaipur', 'USA', 'UK'].map((city) => (
                <div key={city} className="flex items-center space-x-1.5 text-[11px] font-mono" style={{ color: 'var(--k-text-4)' }}>
                  <Phone className="w-3 h-3" />
                  <span>{city}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAssistant}
            className="flex-shrink-0 inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm k-transition hover:opacity-88 active:scale-98"
            style={{
              background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 100%)',
              color: 'var(--k-bg)',
              boxShadow: 'var(--k-shadow-md)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chat with Kaira</span>
          </button>
        </div>
      </section>
    </div>
  );
}
