"use client";

import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { useState } from "react";
import EmailModal from "./EmailModal";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm">
      <div className="flex items-center">
        <Image
          src="/assets/logo.svg"
          alt="Logo"
          width={48}
          height={40}
          className="mr-2"
        />
      </div>
      <Button variant="outline" onClick={() => setIsModalOpen(true)}>
        New Goal
      </Button>
      <EmailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
