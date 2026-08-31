'use client';

// TYPES //
import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

// LIBRARIES //
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';
import { useState } from 'react';

interface RichTextEditorProps {
  /** Form field the HTML is submitted under. */
  name: string;
  /** Existing Story HTML, when editing. */
  defaultValue?: string;
}

/**
 * Story body editor.
 *
 * Emits HTML into a hidden input so the surrounding form still posts to a
 * server action unchanged. The enabled marks map onto the backend sanitiser's
 * allow-list, so nothing an editor can produce here is stripped on save.
 */
export function RichTextEditor({ name, defaultValue = '' }: RichTextEditorProps) {
  // Define Navigation

  // Define Context

  // Define Refs

  // Define States
  const [html, setHtml] = useState<string>(defaultValue);

  const editor = useEditor({
    // Rendered on the client only; SSR would mismatch on hydration.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // StarterKit ships its own Link; disable it so the configured one
        // below is the only extension registered under that name.
        link: false,
        // The public Story page owns horizontal rules and code blocks; the
        // editor does not need to produce them.
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: 'Write the Story...' }),
    ],
    content: defaultValue,
    onUpdate: ({ editor: instance }) => setHtml(instance.getHTML()),
    editorProps: {
      attributes: {
        class: 'admin-prose min-h-72 px-4 py-3 focus:outline-none',
      },
    },
  });

  // Helper Functions

  // Use Effects

  if (!editor) {
    return (
      <div className="min-h-72 rounded-md border border-rule bg-paper px-4 py-3 text-sm text-ink-muted">
        Loading editor...
        <input name={name} type="hidden" value={html} readOnly />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-rule bg-paper">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <input name={name} type="hidden" value={html} readOnly />
    </div>
  );
}

interface ToolbarButtonProps {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

/**
 * Renders one toolbar control.
 */
function ToolbarButton({ active = false, label, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm transition ${
        active ? 'bg-paper-muted text-ink' : 'text-ink-muted hover:bg-paper-muted hover:text-ink'
      }`}
      onClick={onClick}
      // Clicking a button blurs the editor and collapses the selection, so the
      // command lands on the whole document instead of the current block.
      // Preventing mousedown keeps focus and the cursor exactly where it was.
      onMouseDown={(event) => event.preventDefault()}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

interface EditorToolbarProps {
  editor: Editor;
}

/**
 * Renders the formatting controls above the editor.
 */
function EditorToolbar({ editor }: EditorToolbarProps) {
  /**
   * Prompts for a URL and applies it to the current selection.
   */
  const applyLink = (): void => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');

    if (url === null) {
      return;
    }

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  /**
   * Prompts for an image URL and inserts it.
   */
  const applyImage = (): void => {
    const url = window.prompt('Image URL', 'https://');

    if (url && url.trim() !== '') {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-rule px-2 py-2">
      <ToolbarButton
        active={editor.isActive('bold')}
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('italic')}
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-rule" />

      <ToolbarButton
        active={editor.isActive('heading', { level: 2 })}
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('heading', { level: 3 })}
        label="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-rule" />

      <ToolbarButton
        active={editor.isActive('bulletList')}
        label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        &bull;
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('orderedList')}
        label="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('blockquote')}
        label="Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;
      </ToolbarButton>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-rule" />

      <ToolbarButton active={editor.isActive('link')} label="Link" onClick={applyLink}>
        Link
      </ToolbarButton>

      <ToolbarButton label="Image" onClick={applyImage}>
        Image
      </ToolbarButton>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-rule" />

      <ToolbarButton
        label="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        Clear
      </ToolbarButton>
    </div>
  );
}
