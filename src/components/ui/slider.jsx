import * as React from 'react';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="range"
      ref={ref}
      className={cn(
        'w-full h-1.5 rounded-full appearance-none bg-zinc-700 cursor-pointer',
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-50 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
        '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-zinc-50 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400',
        className
      )}
      {...props}
    />
  );
});
Slider.displayName = 'Slider';

export { Slider };
