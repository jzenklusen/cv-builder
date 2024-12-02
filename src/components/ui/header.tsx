"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { Briefcase, FileDown, Wand2, Menu, X } from "lucide-react";
import { FeedbackDialog } from "../FeedbackDialog";
import { exportToPDF } from "@/lib/pdfExport";

export const Header = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const HeaderButtons = () => (
    <>
      <Button
        variant="outline"
        onClick={() => exportToPDF("cv-output", "my-cv.pdf")}
      >
        <FileDown className="w-4 h-4 mr-2" />
        Export as PDF
      </Button>
      <Button variant="outline" onClick={() => setShowFeedback(true)}>
        <Wand2 className="w-4 h-4 mr-2" />
        Enhance with AI
      </Button>
      <Button variant="outline" onClick={() => setShowFeedback(true)}>
        <Briefcase className="w-4 h-4 mr-2" />
        Suggest Jobs
      </Button>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">CV Builder</h1>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-4">
          <HeaderButtons />
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>

        {/* Mobile menu overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden">
            <div className="container mx-auto p-4 flex flex-col gap-2">
              <HeaderButtons />
            </div>
          </div>
        )}

        <FeedbackDialog
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
        />
      </div>
    </header>
  );
};
