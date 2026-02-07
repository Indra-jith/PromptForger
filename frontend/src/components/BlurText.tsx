import { useEffect, useState } from 'react';

type BlurTextProps = {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: 'words' | 'letters';
    direction?: 'top' | 'bottom';
    onAnimationComplete?: () => void;
};

const BlurText: React.FC<BlurTextProps> = ({
    text = '',
    delay = 100,
    className = '',
    animateBy = 'letters',
    direction = 'top',
    onAnimationComplete,
}) => {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Small delay before starting animation
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isReady && onAnimationComplete) {
            const totalDelay = elements.length * delay + 400;
            const timer = setTimeout(onAnimationComplete, totalDelay);
            return () => clearTimeout(timer);
        }
    }, [isReady, elements.length, delay, onAnimationComplete]);

    return (
        <p className={`${className} flex flex-wrap`}>
            {elements.map((segment, index) => (
                <span
                    key={index}
                    className="inline-block blur-text-letter"
                    style={{
                        opacity: isReady ? 1 : 0,
                        filter: isReady ? 'blur(0px)' : 'blur(8px)',
                        transform: isReady ? 'translateY(0)' : `translateY(${direction === 'top' ? '-20px' : '20px'})`,
                        transition: `all 0.5s ease-out ${index * delay}ms`,
                    }}
                >
                    {segment === ' ' ? '\u00A0' : segment}
                    {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
                </span>
            ))}
        </p>
    );
};

export default BlurText;
