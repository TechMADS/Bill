"use client";

import { useState, useEffect } from "react";
import { getSettings, saveSettings, BusinessSettings } from "@/lib/settings";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    setSettings(getSettings());
    setMounted(true);
  }, []);

  if (!mounted || !settings) return null;

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaveStatus("Settings saved successfully!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Settings" 
        action={
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} icon={<Save className="h-4 w-4" />}>
              Save Settings
            </Button>
          </div>
        }
      />

      {saveStatus && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 text-sm">
          {saveStatus}
        </div>
      )}

      <Card>
        <CardHeader title="Business Profile" />
        <CardContent className="space-y-4">
          <Input 
            label="Business Name" 
            value={settings.businessName} 
            onChange={e => handleChange("businessName", e.target.value)} 
          />
          <Input 
            label="Owner Name" 
            value={settings.ownerName} 
            onChange={e => handleChange("ownerName", e.target.value)} 
          />
          <div className="pt-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
            <textarea 
              rows={3}
              value={settings.address} 
              onChange={e => handleChange("address", e.target.value)} 
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Phone Number" 
              value={settings.phone} 
              onChange={e => handleChange("phone", e.target.value)} 
            />
            <Input 
              label="GST Number" 
              value={settings.gstNumber} 
              onChange={e => handleChange("gstNumber", e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Receipt Defaults" />
        <CardContent className="space-y-4">
          <Input 
            label="Default Receiver Name" 
            value={settings.defaultReceiverName} 
            onChange={e => handleChange("defaultReceiverName", e.target.value)} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
