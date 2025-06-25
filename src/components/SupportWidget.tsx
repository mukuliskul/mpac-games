'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAtomValue } from 'jotai';
import { usernameAtom } from '@/state/usernameAtom';

const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const selectedUsername = useAtomValue(usernameAtom);

  const toggleOpen = () => setOpen(!open);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, `You: ${input}`, `Support: Hi ${selectedUsername}, looking into it and will provide an update shortly. Thank you.`]);
    setInput('');
  };

  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={toggleOpen}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'white',
          borderRadius: '50%',
          width: 60,
          height: 60,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          border: 'none',
          cursor: 'pointer',
          padding: 10,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Get Support"
      >
        <Image
          src="https://www.svgrepo.com/show/130326/technical-support.svg"
          alt="Get Support"
          width={40}
          height={40}
          priority
        />
      </button>

      {/* Chat Box */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 300,
            maxHeight: 400,
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              flexGrow: 1,
              padding: 10,
              overflowY: 'auto',
              borderBottom: '1px solid #ddd',
              fontSize: 14,
            }}
          >
            {messages.length === 0 && (
              <p style={{ color: '#666' }}>How can I help you today?</p>
            )}
            {messages.map((msg, idx) => (
              <p key={idx} style={{ margin: '4px 0' }}>
                {msg}
              </p>
            ))}
          </div>

          <div style={{ display: 'flex', padding: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type here..."
              style={{
                flexGrow: 1,
                padding: '6px 8px',
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              style={{
                marginLeft: 8,
                padding: '6px 12px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;
