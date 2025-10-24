import { HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'dark';
  hover?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    glass: 'bg-white/10 backdrop-blur-lg border border-white/20',
    dark: 'bg-gray-900 border border-gray-800',
  };

  const hoverStyles = hover
    ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1'
    : '';

  return (
    <motion.div
      className={`rounded-2xl shadow-lg p-6 ${variantStyles[variant]} ${hoverStyles} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
