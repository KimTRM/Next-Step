/**
 * Card Component - NextStep Platform
 * 
 * Reusable card container for content grouping
 * 
 * HACKATHON TODO:
 * - Add card variants (elevated, outlined, filled)
 * - Add hover effects for interactive cards
 * - Add card actions (buttons in footer)
 * - Add card media support (images, videos)
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export default function Card({
    children,
    className,
    onClick,
    hoverable = false,
}: CardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden',
                hoverable && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}

/**
 * Card Header
 */
interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
            {children}
        </div>
    );
}

/**
 * Card Body
 */
interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
    return (
        <div className={cn('px-6 py-4', className)}>
            {children}
        </div>
    );
}

/**
 * Card Footer
 */
interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={cn('px-6 py-4 bg-gray-50 border-t border-gray-200', className)}>
            {children}
        </div>
    );
}

/**
 * Card Title
 */
interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
            {children}
        </h3>
    );
}

/**
 * Card Description
 */
interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-gray-600 mt-1', className)}>
            {children}
        </p>
    );
}
