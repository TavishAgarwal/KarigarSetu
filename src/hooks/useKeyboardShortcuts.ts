'use client';

import { useEffect, useCallback, useRef } from 'react';

interface ShortcutConfig {
    /** The key to listen for (e.g. 'k', '/', 'Escape') */
    key: string;
    /** Require Ctrl/Cmd modifier */
    ctrlOrMeta?: boolean;
    /** Require Shift modifier */
    shift?: boolean;
    /** Callback when shortcut is triggered */
    handler: () => void;
    /** Description for help overlay */
    description?: string;
}

/**
 * Hook to register keyboard shortcuts for power users.
 * Automatically ignores keypresses when user is typing in inputs/textareas.
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', ctrlOrMeta: true, handler: () => openSearch(), description: 'Search' },
 *   { key: '/', handler: () => focusSearch(), description: 'Focus search' },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore when typing in inputs, textareas, or contenteditable
        const target = e.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable
        ) {
            // Allow Escape to bubble even from inputs
            if (e.key !== 'Escape') return;
        }

        for (const shortcut of shortcutsRef.current) {
            const ctrlOrMeta = e.ctrlKey || e.metaKey;
            const matchesCtrl = shortcut.ctrlOrMeta ? ctrlOrMeta : !ctrlOrMeta;
            const matchesShift = shortcut.shift ? e.shiftKey : !e.shiftKey;
            const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();

            if (matchesKey && matchesCtrl && matchesShift) {
                e.preventDefault();
                shortcut.handler();
                return;
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Pre-built shortcut configs for common marketplace actions.
 */
export const MARKETPLACE_SHORTCUTS: ShortcutConfig[] = [
    { key: 'k', ctrlOrMeta: true, handler: () => {}, description: 'Open search' },
    { key: '/', handler: () => {}, description: 'Focus search bar' },
    { key: 'Escape', handler: () => {}, description: 'Close modal / dialog' },
];
