import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WaitlistResponse {
  priority: number;
  referral_link: string;
  total_referrals: number;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistData, setWaitlistData] = useState<WaitlistResponse | null>(
    null
  );

  const validateEmail = (email: string) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://api.getwaitlist.com/api/v1/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            waitlist_id: 15356,
            referral_link: window.location.href,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit to waitlist");
      }

      const data = await response.json();
      setWaitlistData(data);
    } catch (error) {
      console.error("Error details:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Our Waitlist</DialogTitle>
        </DialogHeader>
        {!waitlistData ? (
          <>
            <p className="text-sm text-gray-500">
              We&apos;re in the process of building new features. Add your email
              to get notified when it&apos;s released.
            </p>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pr-24"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 rounded-l-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
              {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </form>
          </>
        ) : (
          <div className="text-gray-700">
            <p>
              Thank you for signing up. You are waiter{" "}
              <b>{waitlistData.priority}</b> on the waitlist.
            </p>
            <p>
              Referral link is: <b>{waitlistData.referral_link}</b>
            </p>
            <p>
              Total referrals: <b>{waitlistData.total_referrals}</b>
            </p>
            <Button
              onClick={() => setWaitlistData(null)}
              className="mt-4 w-full"
            >
              Return to signup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
