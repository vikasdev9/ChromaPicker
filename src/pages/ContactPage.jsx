import React, { useState } from 'react';
import { Mail, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: 'Feedback', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Thank you! Your message has been sent successfully.', 'success');
  };

  return (
    <div style={{ paddingBottom: 60, maxWidth: 680, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '40px 16px 28px 16px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Contact & Feedback
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Have feature ideas, algorithm suggestions, or bug reports? We would love to hear from you.
        </p>
      </div>

      <div className="chroma-card" style={{ padding: 36 }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--badge-success-bg)', color: 'var(--badge-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
              Message Received!
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              Thanks for reaching out, {form.name}. Our developer team reviews feedback regularly.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-secondary">
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Your Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-text"
                placeholder="Morgan Vance"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-text"
                placeholder="morgan@example.com"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Inquiry Topic
              </label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="input-text"
              >
                <option value="Feedback">Feature Request & Feedback</option>
                <option value="Bug">Bug Report</option>
                <option value="Pro">Chromapick Pro Question</option>
                <option value="Partnership">Partnership & API</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="input-text"
                placeholder="Share your feedback, ideas, or questions here..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '0.95rem', marginTop: 8 }}>
              <Send size={16} />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
