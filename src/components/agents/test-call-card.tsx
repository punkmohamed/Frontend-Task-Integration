import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface TestCallCardProps {
  testFirstName: string;
  testLastName: string;
  testGender: string;
  testPhone: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onStartTestCall: () => void;
  isCalling: boolean;
  isSaving: boolean;
  callStatus: string | null;
}

export function TestCallCard({
  testFirstName,
  testLastName,
  testGender,
  testPhone,
  onFirstNameChange,
  onLastNameChange,
  onGenderChange,
  onPhoneChange,
  onStartTestCall,
  isCalling,
  isSaving,
  callStatus,
}: TestCallCardProps) {
  return (
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Test Call
            </CardTitle>
            <CardDescription>
              Make a test call to preview your agent. Each test call will deduct credits from your
              account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="test-first-name">First Name</Label>
                  <Input
                    id="test-first-name"
                    placeholder="John"
                    value={testFirstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-last-name">Last Name</Label>
                  <Input
                    id="test-last-name"
                    placeholder="Doe"
                    value={testLastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={testGender} onValueChange={onGenderChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <PhoneInput
                  defaultCountry="EG"
                  value={testPhone}
                  onChange={onPhoneChange}
                  placeholder="Enter phone number"
                />
              </div>

              <Button
                className="w-full"
                onClick={onStartTestCall}
                disabled={isCalling || isSaving}
              >
                <Phone className="mr-2 h-4 w-4" />
                {isCalling ? "Starting..." : "Start Test Call"}
              </Button>
              {callStatus && (
                <p className="text-xs text-muted-foreground text-right mt-1">
                  Call status: {callStatus}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

