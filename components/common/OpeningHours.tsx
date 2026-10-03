import { Fragment } from 'react';
import { OPENING_HOURS } from '@/lib/store-info';
import { cn } from '@/lib/utils';

// 兩欄 grid 讓星期與時段各自對齊；窄欄位時只在時段之間的「、」換行
export default function OpeningHours({ className }: { className?: string }) {
  return (
    <dl className={cn('grid grid-cols-[auto_auto] gap-x-2 gap-y-1', className)}>
      {OPENING_HOURS.map(({ day, hours }) => (
        <Fragment key={day}>
          <dt>{day}</dt>
          <dd className="tabular-nums">
            {hours.map((range, index) => (
              <Fragment key={range}>
                {index > 0 && '、'}
                <span className="whitespace-nowrap">{range}</span>
              </Fragment>
            ))}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
