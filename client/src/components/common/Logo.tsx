import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  linkTo?: string;
}

export default function Logo({ size = 'md', showText = true, linkTo = '/' }: LogoProps) {
  const sizeStyles = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const content = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="text-4xl">🏋️</div>
        <div className="absolute -bottom-1 -right-1 text-xs">⚔️</div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold ${sizeStyles[size]} bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
            헬게이터
          </h1>
          <p className="text-xs text-text-light -mt-1">HELLGATER</p>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
