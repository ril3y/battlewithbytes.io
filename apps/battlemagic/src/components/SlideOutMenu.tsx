import React, { useEffect, useState } from 'react';

interface SlideOutMenuProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    width?: string;
    className?: string;
}

export function SlideOutMenu({
    isOpen,
    onClose,
    title,
    children,
    width = 'w-80',
    className = ''
}: SlideOutMenuProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    const onAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    if (!shouldRender) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            <div
                className={`absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />
            <div
                className={`absolute top-0 right-0 h-full ${width} bg-gray-900 border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } ${className}`}
                onTransitionEnd={onAnimationEnd}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
                        <div className="font-bold text-gray-100 text-lg">
                            {title}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
