import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Newspaper, LogIn, UserPlus, LogOut, User, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Newspaper className="h-6 w-6" />
          <span className="font-bold text-xl">Biased India</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user && (
            <Link to="/articles">
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Articles
              </Button>
            </Link>
          )}
          
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
