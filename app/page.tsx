'use client';

/**
 * Main App - NextStep Platform
 * 
 * Single-page application with client-side routing
 */

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing/Footer';
import { HomePage } from '@/components/pages/HomePage';
import { StudyPage } from '@/components/pages/StudyPage';
import { CalendarPage } from '@/components/pages/CalendarPage';
import { ConnectPage } from '@/components/pages/ConnectPage';
import { MaterialsPage } from '@/components/pages/MaterialsPage';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'profile':
        return <StudyPage />;
      case 'applications':
        return <CalendarPage />;
      case 'mentors':
        return <ConnectPage />;
      case 'jobs':
        return <MaterialsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
