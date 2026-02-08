// src/components/layout/admin-layout.tsx
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  navItems: { title: string; href: string; icon: string }[];
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, navItems, title }) => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>{title}</h2>
        <nav>
          <ul>
            {navItems.map(item => (
              <li key={item.href}>
                <a href={item.href}>{item.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
