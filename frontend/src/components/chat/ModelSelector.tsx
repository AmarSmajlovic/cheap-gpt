"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ModelOption } from "@/types/chat";

/**
 * Available model options
 * Requirements: 4.1, 4.2 - Display current model and show dropdown with options
 */
const MODEL_OPTIONS: ModelOption[] = [
    {
        id: "llama-3.1-70b",
        name: "Llama 3.1 70B",
        provider: "Meta",
        available: true,
    },
    {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "OpenAI",
        available: false,
    },
    {
        id: "claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        available: false,
    },
    {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "Google",
        available: false,
    },
];

/**
 * ModelSelector component displays current model and dropdown with options.
 * Requirements: 4.1 - Display current model name (Llama 3.1 70B)
 * Requirements: 4.2 - Show dropdown with model options marked as "Coming Soon"
 * Requirements: 4.3 - Display tooltip for disabled models
 * Requirements: 4.4 - Fixed position at bottom of chat interface
 */
export function ModelSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedModel] = useState<ModelOption>(MODEL_OPTIONS[0]);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            {/* Dropdown Menu - positioned above the button */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-border bg-popover shadow-lg z-50"
                    >
                        <div className="p-2">
                            <p className="text-xs text-muted-foreground px-2 py-1 mb-1">
                                Select Model
                            </p>
                            {MODEL_OPTIONS.map((model) => (
                                <ModelOptionItem
                                    key={model.id}
                                    model={model}
                                    isSelected={model.id === selectedModel.id}
                                    onSelect={() => {
                                        if (model.available) {
                                            setIsOpen(false);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Model Selector Button */}
            <Button
                variant="ghost"
                onClick={toggleDropdown}
                className={cn(
                    "h-auto py-2 px-3 gap-2",
                    "text-muted-foreground hover:text-foreground",
                    "transition-colors duration-200"
                )}
            >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedModel.name}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="h-4 w-4" />
                </motion.div>
            </Button>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}

interface ModelOptionItemProps {
    model: ModelOption;
    isSelected: boolean;
    onSelect: () => void;
}

function ModelOptionItem({ model, isSelected, onSelect }: ModelOptionItemProps) {
    const content = (
        <button
            onClick={onSelect}
            disabled={!model.available}
            className={cn(
                "w-full flex items-center justify-between px-2 py-2 rounded-md",
                "text-sm transition-colors duration-150",
                model.available
                    ? "hover:bg-accent cursor-pointer"
                    : "opacity-60 cursor-not-allowed",
                isSelected && model.available && "bg-accent"
            )}
        >
            <div className="flex flex-col items-start">
                <span className={cn("font-medium", isSelected && "text-primary")}>
                    {model.name}
                </span>
                <span className="text-xs text-muted-foreground">{model.provider}</span>
            </div>
            {!model.available && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    Coming Soon
                </span>
            )}
            {isSelected && model.available && (
                <span className="text-xs text-primary">Active</span>
            )}
        </button>
    );

    // Wrap disabled models with tooltip
    if (!model.available) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right">
                    <p>{model.name} will be available soon!</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
