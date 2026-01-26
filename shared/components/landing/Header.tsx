import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'applications', label: 'Applications' },
    { id: 'mentors', label: 'Mentors' },
    { id: 'profile', label: 'Profile' }
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={() => handleNavigate('home')} className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-primary display-font">NextStep</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`transition-colors ${currentPage === item.id
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-primary hover:text-primary/80 transition-colors">
              Log In
            </button>
            <button className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`transition-colors py-2 text-left ${currentPage === item.id
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <button className="px-4 py-2 text-primary hover:text-primary/80 transition-colors text-left">
                  Log In
                </button>
                <button className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}