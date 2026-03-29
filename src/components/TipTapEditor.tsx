import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2, Quote, Undo, Redo } from 'lucide-react'

interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const toggleButtonClass = (isActive: boolean) =>
        `p-2 rounded-lg transition-colors flex items-center justify-center ${
            isActive ? 'bg-brand-gold-100 text-brand-gold-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 rounded-t-xl">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={toggleButtonClass(editor.isActive('bold'))}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={toggleButtonClass(editor.isActive('italic'))}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={toggleButtonClass(editor.isActive('strike'))}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={toggleButtonClass(editor.isActive('heading', { level: 2 }))}
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={toggleButtonClass(editor.isActive('bulletList'))}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={toggleButtonClass(editor.isActive('orderedList'))}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={toggleButtonClass(editor.isActive('blockquote'))}
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[300px] max-w-none p-4',
            },
        },
    });

    // Update content when value prop changes externally (e.g., loading data)
    if (editor && value !== editor.getHTML() && value) {
        // Prevent cursor jump
        // Wait! We avoid updating editor if it's identical or already typing.
        // We only forcefully set it if the editor content is completely empty and value isn't.
        if (editor.getHTML() === '<p></p>' || !editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-brand-gold-400/50 focus-within:border-brand-gold-400 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
