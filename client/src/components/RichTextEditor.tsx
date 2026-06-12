import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Bold, Italic, Heading1, Heading2, List, ListOrdered, 
  Quote, Link2, Image, Code, Eye, Edit3, Columns, RotateCcw 
} from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  storageKey?: string;
  placeholder?: string;
}

type EditorMode = 'edit' | 'preview' | 'split';

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  storageKey = 'blog_draft',
  placeholder = 'Write your article using Markdown here...'
}) => {
  const [mode, setMode] = useState<EditorMode>('split');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [hasDraft, setHasDraft] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically switch split mode to write-only on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && mode === 'split') {
        setMode('edit');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger once on mount
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  // Check for auto-saved draft on mount
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved && saved !== value && saved.trim() !== '') {
        setHasDraft(true);
      }
    }
  }, [storageKey]);

  // Save changes locally on debounce
  useEffect(() => {
    if (storageKey && value) {
      localStorage.setItem(storageKey, value);
    }
  }, [value, storageKey]);

  const restoreDraft = () => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        onChange(saved);
        setHasDraft(false);
      }
    }
  };

  const discardDraft = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
    }
  };

  // Helper to insert markdown syntax at cursor position
  const insertMarkup = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = before + (selectedText || after ? selectedText : '') + after;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Refocus and place cursor appropriately
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText || after).length
      );
    }, 10);
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      const altText = imageAlt || 'featured image';
      insertMarkup(`![${altText}](${imageUrl})`, '');
      setImageUrl('');
      setImageAlt('');
      setShowImageModal(false);
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      const text = linkText || 'link';
      insertMarkup(`[${text}](${linkUrl})`, '');
      setLinkUrl('');
      setLinkText('');
      setShowLinkModal(false);
    }
  };

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden min-h-[500px]">
      
      {/* Auto-save notification ribbon */}
      {hasDraft && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-b border-amber-100 dark:border-amber-900/40 text-sm">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 animate-spin-reverse" />
            <span>It looks like you have an unsaved local draft. Would you like to restore it?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={restoreDraft}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-semibold text-xs transition-colors"
            >
              Restore
            </button>
            <button
              onClick={discardDraft}
              className="px-2.5 py-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs transition-colors font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 gap-2">
        {/* Markdown Shortcuts */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertMarkup('**', '**')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('*', '*')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('# ')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Heading 1 (# Heading)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('## ')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Heading 2 (## Subheading)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <span className="w-px h-6 bg-slate-200 dark:bg-slate-850 mx-1" />
          <button
            type="button"
            onClick={() => insertMarkup('- ')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Bullet List (- item)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('1. ')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Numbered List (1. item)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('> ')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Blockquote (> quote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <span className="w-px h-6 bg-slate-200 dark:bg-slate-850 mx-1" />
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Insert Link ([text](url))"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Embed Image (![alt](url))"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('```javascript\n', '\n```')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Code Block (```lang)"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* View togglers */}
        <div className="flex items-center bg-slate-200/50 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'edit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'preview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'split'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Split
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex min-h-[400px]">
        {/* Write Pane */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={`flex-1 flex flex-col ${mode === 'split' ? 'border-r border-slate-200 dark:border-slate-800' : ''}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 p-6 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        )}

        {/* Preview Pane */}
        {(mode === 'preview' || mode === 'split') && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/20 max-h-[600px]">
            {value.trim() === '' ? (
              <p className="text-slate-400 italic text-sm">Nothing to preview yet. Start writing above!</p>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base prose-headings:font-display prose-headings:font-bold prose-a:text-brand-500 prose-pre:p-0 prose-pre:bg-transparent">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {value}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insert Image Dialog Overlay */}
      {showImageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <form onSubmit={handleAddImage} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4">Embed Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-550 dark:text-slate-400 mb-1.5">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/cover.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-550 dark:text-slate-400 mb-1.5">Alt Text / Caption</label>
                <input
                  type="text"
                  placeholder="A descriptive caption"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
              >
                Insert Image
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Insert Link Dialog Overlay */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <form onSubmit={handleAddLink} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4">Insert Hyperlink</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-550 dark:text-slate-400 mb-1.5">Link URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://google.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-550 dark:text-slate-400 mb-1.5">Link Text</label>
                <input
                  type="text"
                  placeholder="Read more here"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
              >
                Insert Link
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
export default RichTextEditor;
