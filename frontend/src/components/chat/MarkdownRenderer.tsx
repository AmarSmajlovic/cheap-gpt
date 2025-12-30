"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/**
 * MarkdownRenderer component renders markdown content with syntax highlighting.
 * Requirements: 2.2
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("markdown-content", className)}>
            <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Code blocks with dark theme styling
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline = !match;

                        if (isInline) {
                            return (
                                <code
                                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code className={cn("block", className)} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Pre block wrapper for code blocks
                    pre({ children, ...props }) {
                        return (
                            <pre
                                className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto my-3 text-sm"
                                {...props}
                            >
                                {children}
                            </pre>
                        );
                    },
                    // Paragraphs
                    p({ children, ...props }) {
                        return (
                            <p className="mb-2 last:mb-0" {...props}>
                                {children}
                            </p>
                        );
                    },
                    // Unordered lists
                    ul({ children, ...props }) {
                        return (
                            <ul className="list-disc list-inside mb-2 space-y-1" {...props}>
                                {children}
                            </ul>
                        );
                    },
                    // Ordered lists
                    ol({ children, ...props }) {
                        return (
                            <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>
                                {children}
                            </ol>
                        );
                    },
                    // List items
                    li({ children, ...props }) {
                        return (
                            <li className="ml-2" {...props}>
                                {children}
                            </li>
                        );
                    },
                    // Bold text
                    strong({ children, ...props }) {
                        return (
                            <strong className="font-semibold" {...props}>
                                {children}
                            </strong>
                        );
                    },
                    // Italic text
                    em({ children, ...props }) {
                        return (
                            <em className="italic" {...props}>
                                {children}
                            </em>
                        );
                    },
                    // Links
                    a({ children, href, ...props }) {
                        return (
                            <a
                                href={href}
                                className="text-primary underline hover:opacity-80 transition-opacity"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    // Blockquotes
                    blockquote({ children, ...props }) {
                        return (
                            <blockquote
                                className="border-l-4 border-primary/50 pl-4 italic my-2 text-muted-foreground"
                                {...props}
                            >
                                {children}
                            </blockquote>
                        );
                    },
                    // Headings
                    h1({ children, ...props }) {
                        return (
                            <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0" {...props}>
                                {children}
                            </h1>
                        );
                    },
                    h2({ children, ...props }) {
                        return (
                            <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0" {...props}>
                                {children}
                            </h2>
                        );
                    },
                    h3({ children, ...props }) {
                        return (
                            <h3 className="text-base font-bold mb-2 mt-2 first:mt-0" {...props}>
                                {children}
                            </h3>
                        );
                    },
                    // Horizontal rule
                    hr({ ...props }) {
                        return <hr className="border-border my-4" {...props} />;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
