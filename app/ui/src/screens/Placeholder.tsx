import type { NavItem } from '../nav';

export function Placeholder({ item }: { item: NavItem }) {
  return (
    <>
      <h1 className="h1">{item.label}</h1>
      <section className="card">
        <p style={{ margin: 0 }}>Cet écran arrive au jalon {item.milestone}.</p>
      </section>
    </>
  );
}
