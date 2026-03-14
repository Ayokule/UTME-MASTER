// ==========================================
// RICH TEXT EDITOR COMPONENT
// ==========================================
// Easy-to-use rich text editor for questions
//
// Usage:
// <RichTextEditor
//   value={content}
//   onChange={setContent}
//   placeholder="Enter question..."
// />

import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    readOnly?: boolean
    height?: string
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start typing...',
    readOnly = false,
    height = '200px'
}: RichTextEditorProps) {

    // ==========================================
    // TOOLBAR CONFIGURATION
    // ==========================================
    // Customize which buttons appear in toolbar
    const modules = {
        toolbar: [
            // Text formatting
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],

            // Colors
            [{ 'color': [] }, { 'background': [] }],

            // Lists
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],

            // Alignment
            [{ 'align': [] }],

            // Insert
            ['link', 'image'],

            // Clear formatting
            ['clean']
        ],
    }

    // ==========================================
    // ALLOWED FORMATS
    // ==========================================
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'align',
        'link', 'image'
    ]

    return (
        <div className="rich-text-editor">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={readOnly}
                style={{ height }}
            />
        </div>
    )
}
