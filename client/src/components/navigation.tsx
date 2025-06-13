import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/questionnaire", label: "Sacred Reading", auth: true },
    { href: "/dashboard", label: "Dashboard", auth: true },
  ];

  const adminItems = user?.isAdmin ? [
    { href: "/admin", label: "Oracle Chamber" },
  ] : [];

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-4' : 'items-center space-x-8'}`}>
      {navigationItems
        .filter(item => !item.auth || isAuthenticated)
        .map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={`hover:text-yellow-400 transition-colors duration-300 ${
                location === item.href ? 'text-yellow-400' : 'text-white'
              }`}
              onClick={() => mobile && setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          </Link>
        ))}
      {adminItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a
            className={`hover:text-yellow-400 transition-colors duration-300 ${
              location === item.href ? 'text-yellow-400' : 'text-white'
            }`}
            onClick={() => mobile && setMobileMenuOpen(false)}
          >
            {item.label}
          </a>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="relative z-50 mystical-card border-b border-yellow-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link href="/">
            <a className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-pink-400 flex items-center justify-center animate-pulse-glow">
                <Moon className="text-purple-900 text-xl" />
              </div>
              <h1 className="font-playfair text-3xl font-bold">
                <span className="shimmer-text text-yellow-400">Mira</span>
              </h1>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItems />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-yellow-400">
                    <User className="w-4 h-4" />
                    <span>{user?.fullName || user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mystical-card border-yellow-400/20">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/questionnaire">
                <Button className="bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300">
                  Begin Journey
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-yellow-400">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 mystical-card border-yellow-400/20">
                <div className="flex flex-col space-y-8 mt-8">
                  <NavItems mobile />
                  
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-4 pt-4 border-t border-yellow-400/20">
                      <div className="flex items-center space-x-3 text-yellow-400">
                        <User className="w-5 h-5" />
                        <span>{user?.fullName || user?.username}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => logout()}
                        className="justify-start text-white hover:text-yellow-400"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Link href="/questionnaire">
                      <Button 
                        className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Begin Journey
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
