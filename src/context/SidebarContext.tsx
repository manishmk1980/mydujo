import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'mdpl-sidebar-collapsed';

interface SidebarProviderProps {
  children: React.ReactNode;
  /** Persist collapsed state to localStorage (default: true) */
  persist?: boolean;
}

export function SidebarProvider({ children, persist = true }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (persist && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    }
    return false;
  });
  const [openMobile, setOpenMobile] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (openMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openMobile]);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsCollapsed(!open);
      if (persist && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(!open));
      }
    },
    [persist]
  );

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (persist && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, [persist]);

  const toggleMobile = useCallback(() => {
    setOpenMobile((prev) => !prev);
  }, []);

  // Keyboard shortcut: Ctrl+B / Cmd+B
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setOpen,
        openMobile,
        setOpenMobile,
        toggleMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return ctx;
}
