import React, { useState } from 'react';
import { X, Send, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MessageReplyModalProps {
  contact: {
    id: string;
    name: string;
    email: string;
    message: string;
    status: string;
  };
  onClose: () => void;
  onSend: () => void;
}

const replyTemplates = [
  {
    id: 'thank-you',
    name: 'Thank You',
    subject: 'Thank you for your message',
    body: `Dear {name},

Thank you for reaching out. I appreciate your message and will get back to you with a detailed response soon.

Best regards,
Vaibhav Bhardwaj`
  },
  {
    id: 'follow-up',
    name: 'Follow Up Meeting',
    subject: 'Follow-up to your inquiry',
    body: `Dear {name},

Thank you for your message. I would love to schedule a meeting to discuss this further.

Would you be available for a brief call this week?

Best regards,
Vaibhav Bhardwaj`
  },
  {
    id: 'collaboration',
    name: 'Collaboration Interest',
    subject: 'Regarding potential collaboration',
    body: `Dear {name},

Thank you for reaching out about potential collaboration opportunities. I'm interested in learning more about your proposal.

Could you please provide more details about:
- Your project timeline
- Specific areas of collaboration
- Expected outcomes

Looking forward to your response.

Best regards,
Vaibhav Bhardwaj`
  }
];

export const MessageReplyModal: React.FC<MessageReplyModalProps> = ({ contact, onClose, onSend }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(replyTemplates[0].id);
  const [subject, setSubject] = useState(replyTemplates[0].subject);
  const [body, setBody] = useState(replyTemplates[0].body.replace('{name}', contact.name));
  const [copyStatus, setCopyStatus] = useState<'subject' | 'body' | null>(null);

  const handleTemplateChange = (templateId: string) => {
    const template = replyTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body.replace('{name}', contact.name));
    }
  };

  const handleSend = async () => {
    try {
      // Update message status in database
      const { error } = await supabase
        .from('contacts')
        .update({ 
          status: 'replied',
          replied_at: new Date().toISOString()
        })
        .eq('id', contact.id);

      if (error) throw error;

      // Open email client
      const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      onSend();
      onClose();
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-emerald dark:text-sage">Reply to Message</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Original Message */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Original Message
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">From:</span> {contact.name} ({contact.email})
              </p>
              <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>

          {/* Reply Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                         focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
              >
                {replyTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                           focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                />
                <button
                  onClick={() => copyToClipboard(subject, 'subject')}
                  className="p-2 text-emerald hover:text-emerald-700 dark:text-sage"
                  title="Copy subject"
                >
                  {copyStatus === 'subject' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <div className="flex gap-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                           focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                />
                <button
                  onClick={() => copyToClipboard(body, 'body')}
                  className="p-2 text-emerald hover:text-emerald-700 dark:text-sage"
                  title="Copy message"
                >
                  {copyStatus === 'body' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                     dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                     transition-colors duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
};