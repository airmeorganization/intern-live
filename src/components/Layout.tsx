import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <main className="flex-1 w-full max-w-lg mx-auto bg-white shadow-sm pt-6 px-4">
        {children}
      </main>
      <div className="w-full max-w-lg mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}
