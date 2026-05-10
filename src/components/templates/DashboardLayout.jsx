import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@components/organisms/Navbar';
import Sidebar from '@components/organisms/Sidebar';
import { useAuth } from '@hooks/useAuth';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout: handleLogout } = useAuth();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar
          user={user}
          onLogout={handleLogout}
          notificationCount={0}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
