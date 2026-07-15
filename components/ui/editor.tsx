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
    ListOrdered
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
        return <EditorContent editor={editor} className="rounded-md border bg-muted/30" />
    }

    return (
        <div className="overflow-hidden rounded-md border bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1.5">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    aria-label="Bold"
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    aria-label="Italic"
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                    aria-label="Underline"
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    aria-label="Bulleted list"
                    title="Bulleted list"
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    aria-label="Numbered list"
                    title="Numbered list"
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}
