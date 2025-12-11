import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,  // ← Changed from History
  Award,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Available Exams', href: '/student/exams', icon: FileText },
    { name: 'My Results', href: '/student/results', icon: Award },
    { name: 'Performance', href: '/student/performance', icon: TrendingUp },  // ← Changed from History
    { name: 'Profile', href: '/student/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/student') {
      return location.pathname === '/student';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/student" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm">प</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-semibold text-sm">Pariksha</span>
              <span className="text-[10px] text-muted-foreground">Student Portal</span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="p-2 hover:bg-accent rounded-lg transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* User info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
              <div className="h-7 w-7 rounded-full bg-foreground flex items-center justify-center">
                <span className="text-background text-xs font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-medium">{user?.fullName}</span>
                <span className="text-[10px] text-muted-foreground">Student</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-background border-r z-50 lg:hidden"
            >
              <SidebarContent
                navigation={navigation}
                isActive={isActive}
                handleLogout={handleLogout}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16 border-r">
        <SidebarContent
          navigation={navigation}
          isActive={isActive}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Sidebar Content Component
const SidebarContent = ({ navigation, isActive, handleLogout, onClose }) => (
  <div className="flex flex-col h-full">
    {/* Mobile close button */}
    {onClose && (
      <div className="flex items-center justify-between p-4 border-b lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-sm">प</span>
          </div>
          <span className="font-semibold">Pariksha</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>
    )}

    {/* Navigation */}
    <nav className="flex-1 p-4 space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      ))}
    </nav>

    {/* Bottom section */}
    <div className="p-4 border-t space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        © 2025 Pariksha
      </p>
    </div>
  </div>
);

export default StudentLayout;
