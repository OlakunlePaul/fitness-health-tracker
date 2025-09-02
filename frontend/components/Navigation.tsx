import { Link, useLocation } from 'react-router-dom';
import { Activity, Home, Dumbbell, Apple, BarChart3, User, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';

const publicNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Login', href: '/login', icon: LogIn },
  { name: 'Sign Up', href: '/signup', icon: User },
];

const authenticatedNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell },
  { name: 'Nutrition', href: '/nutrition', icon: Apple },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = user ? authenticatedNavigation : publicNavigation;

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">FitTracker</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
