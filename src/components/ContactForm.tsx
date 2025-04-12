'use client';

import { useState } from 'react';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<string>('');
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong. Please try again.');
      }
      
      setStatus('success');
      // Reset form after successful submission
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2 font-mono text-green-400">
          NAME_
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formState.name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2 font-mono text-green-400">
          EMAIL_
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formState.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Subject field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2 font-mono text-green-400">
          SUBJECT_
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={formState.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Message field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2 font-mono text-green-400">
          MESSAGE_
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          value={formState.message}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-md shadow-sm font-mono text-white resize-none"
          disabled={status === 'submitting'}
        />
      </div>
      
      {/* Submission button and status */}
      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-3 px-6 flex justify-center items-center bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-white font-medium rounded-md transition duration-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? (
            <>
              <span className="inline-block mr-2">SENDING</span>
              <span className="animate-pulse">...</span>
            </>
          ) : (
            'SUBMIT_'
          )}
        </button>
      </div>
      
      {/* Success message */}
      {status === 'success' && (
        <div className="p-4 border-l-4 border-green-500 bg-green-500/20 rounded-md">
          <p className="font-mono text-green-400">
            Message sent successfully! I&apos;ll get back to you soon.
          </p>
        </div>
      )}
      
      {/* Error message */}
      {status === 'error' && (
        <div className="p-4 border-l-4 border-red-500 bg-red-500/20 rounded-md">
          <p className="font-mono text-red-400">
            {error || 'An error occurred. Please try again later.'}
          </p>
        </div>
      )}
    </form>
  );
}
