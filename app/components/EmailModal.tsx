import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add email submission logic here
    console.log("Email submitted:", email);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          We're in the process of building new features. Add your email to get
          notified when it's released.
        </p>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pr-24" // Add padding to the right to accommodate the button
            />
            <Button
              type="submit"
              className="absolute right-0 top-0 bottom-0 rounded-l-none"
            >
              Notify Me
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
