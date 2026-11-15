import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ExternalLink, Inbox, Mail, MapPin, Pencil, Send } from 'lucide-react';
import { useOwnerMode } from '../context/OwnerModeContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { ImageSlot } from './ImageSlot';
import { SpotlightCard } from './SpotlightCard';

interface ContactSectionProps {
  onOpenLightbox: (src: string, alt: string) => void;
  onEditProfile: () => void;
  onOpenInbox: () => void;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactSection({
  onOpenLightbox,
  onEditProfile,
  onOpenInbox,
}: ContactSectionProps) {
  const { profile } = usePortfolioData();
  const { isOwnerMode, unreadCount, refreshMessages } = useOwnerMode();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<FormState | null>(null);
  const [copied, setCopied] = useState(false);

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'RG';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email address, and message.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Could not send message right now.');
      }
      setSubmittedData({ ...form });
      setForm({ name: '', email: '', subject: '', message: '' });
      if (isOwnerMode) {
        void refreshMessages();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium text-teal-400">Get in Touch</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Contact
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
              Have a full-stack opportunity, collaboration idea, or feedback on my projects? Reach out directly.
            </p>
          </motion.div>

          {isOwnerMode && (
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={onOpenInbox}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
              >
                <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  Inbox{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0C1317] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Edit Contact Info</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Contact Details + Small Round Photo Slot */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <SpotlightCard className="h-full p-7">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 shrink-0 rounded-full border border-teal-400/25 p-1 bg-[#091014]">
                      <ImageSlot
                        slotId="contact-avatar"
                        alt={`${profile.name} profile photo`}
                        roundedClassName="rounded-full"
                        className="h-full w-full"
                        compact
                        reuseFromSlotId="home-profile"
                        variant="monogram"
                        monogramInitials={initials}
                        onImageClick={onOpenLightbox}
                      />
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-semibold text-slate-50">
                        {profile.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-teal-300">{profile.role}</p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-5 border-t border-white/8 pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 h-4 w-4 text-amber-300 shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-medium text-slate-400">Email</p>
                          <a
                            href={`mailto:${profile.email}`}
                            className="mt-0.5 block text-sm font-medium text-slate-100 transition-colors hover:text-teal-300"
                          >
                            {profile.email}
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                            <span className="text-teal-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-teal-300 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium text-slate-400">Location</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-100">{profile.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/8 pt-6 text-sm">
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-teal-300"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-teal-300"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Real Server-Backed Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <SpotlightCard accent="gold" className="h-full p-7">
              {submittedData ? (
                <div className="flex h-full flex-col items-start justify-center py-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-500/15 text-teal-300">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-slate-50">
                    Message delivered, {submittedData.name}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                    Thank you for reaching out. Your note regarding{' '}
                    <span className="font-medium text-amber-300">
                      {submittedData.subject || 'your inquiry'}
                    </span>{' '}
                    has been saved directly to my portfolio inbox. You can also email me anytime at{' '}
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-teal-300 underline underline-offset-4"
                    >
                      {profile.email}
                    </a>
                    .
                  </p>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="mt-6 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-medium text-slate-300"
                      >
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Alex Verma"
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11]/90 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-teal-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium text-slate-300"
                      >
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="alex@example.com"
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11]/90 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-teal-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Full-stack opportunity or project feedback"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11]/90 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell me a little about what you are working on..."
                      className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-[#080E11]/90 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-xs font-medium text-rose-400">
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <p className="text-xs text-slate-500">Replies typically within 24 hours.</p>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-[#061210] transition-colors hover:bg-teal-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 whitespace-nowrap shrink-0"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              )}
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
