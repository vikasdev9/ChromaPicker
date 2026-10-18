import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AuthModal({ isOpen, mode = 'login', onClose, onSwitchMode }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`${mode === 'login' ? 'Signed in' : 'Account created'} successfully! (Frontend Demo)`, 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {mode === 'login'
              ? 'Access your saved palettes and sync your color libraries.'
              : 'Join Chromapick to save unlimited palettes and custom schemes.'}
          </p>
          <div
            style={{
              marginTop: 10,
              background: 'rgba(37, 150, 190, 0.1)',
              color: 'var(--color-accent-blue)',
              padding: '3px 10px',
              borderRadius: 16,
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'inline-block'
            }}
          >
            Frontend Demonstration UI
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-text"
                  style={{ paddingLeft: 38 }}
                />
                <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-text"
                style={{ paddingLeft: 38 }}
              />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-text"
                style={{ paddingLeft: 38 }}
              />
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 8, padding: '11px' }}>
            {mode === 'login' ? 'Sign In' : 'Create Free Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => onSwitchMode('signup')}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontWeight: 600, cursor: 'pointer' }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
