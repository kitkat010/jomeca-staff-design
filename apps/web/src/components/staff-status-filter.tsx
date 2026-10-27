import { Menu } from '@base-ui/react/menu';
import { Check, ListFilter } from 'lucide-react';

const options = [
  ['all', 'All statuses'],
  ['pending', 'Pending'],
  ['confirmed', 'Reserved'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
  ['expired', 'Expired'],
  ['rejected', 'Rejected'],
] as const;

export function StaffStatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const current = options.find(([key]) => key === value)?.[1] ?? 'All statuses';
  return (
    <Menu.Root>
      <Menu.Trigger
        className="staff-status-filter-trigger"
        data-filtered={value !== 'all' ? '' : undefined}
        aria-label={`Filter reservation status: ${current}`}
        title={`Filter status · ${current}`}
      >
        <ListFilter size={20} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={10}
          className="staff-status-menu-positioner"
        >
          <Menu.Popup className="staff-status-menu">
            <div className="staff-status-menu-label">Reservation status</div>
            <Menu.RadioGroup
              value={value}
              onValueChange={(next) => onChange(String(next))}
              aria-label="Reservation status"
            >
              {options.map(([key, label]) => (
                <Menu.RadioItem
                  key={key}
                  value={key}
                  closeOnClick
                  className="staff-status-menu-item"
                >
                  <span>{label}</span>
                  <Menu.RadioItemIndicator>
                    <Check size={15} aria-hidden="true" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
