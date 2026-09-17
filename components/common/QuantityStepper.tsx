'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  /** 整體停用，例如商品售完或尚未選擇規格 */
  disabled?: boolean;
  className?: string;
};

export default function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const emitChange = (next: number) => {
    onChange(Math.min(Math.max(next, min), max));
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="減少商品數量"
        disabled={disabled || value <= min}
        onClick={() => emitChange(value - 1)}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-6 text-center text-sm">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="增加商品數量"
        disabled={disabled || value >= max}
        onClick={() => emitChange(value + 1)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
