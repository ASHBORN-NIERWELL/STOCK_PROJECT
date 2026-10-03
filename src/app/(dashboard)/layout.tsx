"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { AskTutorPanel } from "@/components/layout/AskTutorPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tutorOpen, setTutorOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <DisclaimerBanner />
      <Navbar onOpenTutor={() => setTutorOpen(!tutorOpen)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <AskTutorPanel isOpen={tutorOpen} onClose={() => setTutorOpen(false)} />
      <Footer />
    </div>
  );
}
