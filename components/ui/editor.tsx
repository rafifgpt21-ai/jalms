"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Toggle } from "@/components/ui/toggle"
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Link as LinkIcon,
    Heading1,
    Heading2
} from "lucide-react"
import React from 'react'

interface EditorProps {
    value: string
    onChange: (value: string) => void
    editable?: boolean
    className?: string
}

export function Editor({ value, onChange, editable = true, className }: EditorProps) {
    // Force re-render on editor state changes to update toolbar active states
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        editable: editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        onSelectionUpdate: () => {
            forceUpdate()
        },
        onTransaction: () => {
            forceUpdate()
        },
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert max-w-none p-4 focus:outline-none ${className || 'min-h-[400px]'}`,
            },
        },
    })

    if (!editor) {
        return null
    }

    if (!editable) {
        return <EditorContent editor={editor} className="border rounded-md bg-gray-50 dark:bg-gray-900" />
    }

    return (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-black">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-900">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}
