import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PayPalButton from "./PayPalButton";
import { CreditCard } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentOption {
  price: string;
  credits: number;
  popular?: boolean;
}

const paymentOptions: PaymentOption[] = [
  { price: "5.00", credits: 5000 },
  { price: "10.00", credits: 20000, popular: true },
  { price: "100.00", credits: 500000 },
  { price: "1000.00", credits: 10000000 },
];

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null);

  const handleOptionSelect = (option: PaymentOption) => {
    setSelectedOption(option);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Purchase Credits</span>
          </DialogTitle>
          <DialogDescription>
            Select a credit package and complete your purchase securely through PayPal. No email required from our app.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedOption ? (
            <>
              <p className="text-sm text-muted-foreground">
                Choose a credit package to unlock full AI features. PayPal handles payment securely - no email required from our app:
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {paymentOptions.map((option, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                      option.popular ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>${option.price}</span>
                        {option.popular && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {option.credits.toLocaleString()} credits
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  ${selectedOption.price} - {selectedOption.credits.toLocaleString()} Credits
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete your purchase with PayPal - login to PayPal or pay as guest with card
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <PayPalButton
                  amount={selectedOption.price}
                  currency="USD"
                  intent="CAPTURE"
                />
                
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedOption(null)}
                  className="w-full"
                >
                  Back to Options
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}