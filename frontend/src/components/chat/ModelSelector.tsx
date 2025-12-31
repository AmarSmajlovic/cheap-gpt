"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { useState } from "react";

/**
 * ModelSelector component displays current model and dropdown with options.
 * Fetches available models from backend /models endpoint.
 */
export function ModelSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        selectedModel,
        availableModels,
        setSelectedModel,
        loadModels
    } = useChatStore();

    // Load models on mount
    useEffect(() => {
        loadModels();
    }, [loadModels]);

    const currentModel = availableModels.find(m => m.id === selectedModel)
        || { id: 'auto', name: 'Auto', description: 'Loading...', available: true };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (modelId: string) => {
        setSelectedModel(modelId);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 w-72 rounded-lg border border-border bg-popover shadow-lg z-50"
                    >
                        <div className="p-2">
                            <p className="text-xs text-muted-foreground px-2 py-1 mb-1">
                                Select Model
                            </p>
                            {availableModels.map((model) => (
                                <ModelOptionItem
                                    key={model.id}
                                    model={model}
                                    isSelected={model.id === selectedModel}
                                    onSelect={() => handleSelect(model.id)}
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
                {selectedModel === 'auto' ? (
                    <Zap className="h-4 w-4 text-yellow-500" />
                ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-medium">{currentModel.name}</span>
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
    model: {
        id: string;
        name: string;
        description?: string;
        best_for?: string;
        available: boolean;
    };
    isSelected: boolean;
    onSelect: () => void;
}

function ModelOptionItem({ model, isSelected, onSelect }: ModelOptionItemProps) {
    const content = (
        <button
            onClick={onSelect}
            disabled={!model.available}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-md",
                "text-sm transition-colors duration-150",
                model.available
                    ? "hover:bg-accent cursor-pointer"
                    : "opacity-60 cursor-not-allowed",
                isSelected && model.available && "bg-accent"
            )}
        >
            <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-2">
                    {model.id === 'auto' ? (
                        <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                    )}
                    <span className={cn("font-medium", isSelected && "text-primary")}>
                        {model.name}
                    </span>
                </div>
                {model.description && (
                    <span className="text-xs text-muted-foreground ml-5">
                        {model.description}
                    </span>
                )}
            </div>
            {isSelected && model.available && (
                <Check className="h-4 w-4 text-primary" />
            )}
        </button>
    );

    if (!model.available) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right">
                    <p>{model.name} is currently unavailable</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
