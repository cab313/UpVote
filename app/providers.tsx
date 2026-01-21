'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useContext } from 'react';

// Demo mode context for mock authentication
interface DemoContextValue {
  isDemoMode: boolean;
  demoUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    isAdmin: boolean;
  } | null;
}

const DemoContext = createContext<DemoContextValue>({
  isDemoMode: false,
  demoUser: null,
});

export function useDemoMode() {
  return useContext(DemoContext);
}

interface ProvidersProps {
  children: React.ReactNode;
}

// Demo user for testing without auth
const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@meta.com',
  image: null,
  isAdmin: true,
};

export function Providers({ children }: ProvidersProps) {
  // Hardcoded to true for demo/showcase purposes
  // Change to: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' when integrating with real auth
  const isDemoMode = true;

  // In demo mode, provide a mock session
  const mockSession = isDemoMode
    ? {
        user: {
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          email: DEMO_USER.email,
          image: DEMO_USER.image,
          isAdmin: DEMO_USER.isAdmin,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    : undefined;

  return (
    <DemoContext.Provider value={{ isDemoMode, demoUser: isDemoMode ? DEMO_USER : null }}>
      <SessionProvider session={mockSession}>{children}</SessionProvider>
    </DemoContext.Provider>
  );
}
