import { NAV, type ScreenId } from '../nav';
import { Icon } from './Icon';

interface Props {
  active: ScreenId;
  onSelect: (id: ScreenId) => void;
}

export function SideNav({ active, onSelect }: Props) {
  return (
    <nav className="sidenav" aria-label="Menu principal">
      {NAV.map((item) => (
        <button
          key={item.id}
          type="button"
          className="sidenav__item"
          aria-current={item.id === active ? 'page' : undefined}
          onClick={() => onSelect(item.id)}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
