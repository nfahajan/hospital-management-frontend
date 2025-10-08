"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building,
  Menu,
  X,
  User,
  Briefcase,
  FileText,
  Building2,
  ChevronDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";

export default function Header({
  onMenuClick,
  expanded,
  onExpandToggle,
}: {
  onMenuClick?: () => void;
  expanded: boolean;
  onExpandToggle: () => void;
}) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <header className="flex justify-between items-center h-16 pr-6 bg-white border-b shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button className="block lg:hidden mr-2" onClick={onMenuClick}>
          <Menu />
        </button>
        <button
          className="hidden lg:inline-flex ml-2 p-1 rounded hover:bg-gray-100"
          onClick={onExpandToggle}
        >
          {expanded ? <ChevronLeft /> : <ChevronRight />}
        </button>
        <span className="font-bold text-lg">Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-12 border rounded-full items-center gap-2 hover:bg-gray-100"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-3">
              <span className="hidden sm:inline text-sm font-medium">
                {user?.email || "Profile"}
              </span>
            </div>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href={`/${user?.roles?.[0]}/profile`}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
