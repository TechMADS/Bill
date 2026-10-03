
"use client";

import { useState, useEffect } from "react";
import {
  getAuthenticatedSettings,
  saveAuthenticatedSettings,
  BusinessSettings,
} from "@/lib/settings";
import { Check, Eye, EyeOff, Save, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  useEffect(() => {
    getAuthenticatedSettings()
      .then(setSettings)
      .catch((error) =>
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load settings."
        )
      )
      .finally(() => setMounted(true));
  }, []);

  if (!mounted) {
    return <p className="text-sm text-slate-600">Loading business profile...</p>;
  }

  if (!settings) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || "Unable to load settings."}
      </div>
    );
  }

  const handleChange = <Field extends keyof BusinessSettings,>(field: Field, value: BusinessSettings[Field]) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const saved = await saveAuthenticatedSettings(settings);
      setSettings(saved);
      setSaveStatus("Settings saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <PageHeader
        title="Settings"
        action={
          <Button onClick={handleSave} disabled={saving} icon={<Save className="h-4 w-4" />}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        }
      />

      {saveStatus && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{saveStatus}</div>}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Business Profile */}
      <Card>
        <CardHeader title="Business Profile" />

        <CardContent className="space-y-4">
          <Input
            label="Business Name"
            value={settings.businessName}
            readOnly
          />

          <Input
            label="Owner Name"
            value={settings.ownerName}
            readOnly
          />

          <div className="pt-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Address
            </label>

            <textarea
              rows={3}
              value={settings.address}
              readOnly
              className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={settings.phone}
              readOnly
            />

            <Input
              label="GST Number"
              value={settings.gstNumber}
              readOnly
            />
          </div>

          <Input label="State" value={settings.state} readOnly />
          <Input label="Shop ID" value={settings.shopId} readOnly />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Warranty Option" />
        <CardContent>
          <div className="inline-flex rounded-md border border-slate-300 p-1" role="group" aria-label="Warranty option">
            <Button
              type="button"
              variant={settings.warrantyEnabled ? "primary" : "ghost"}
              aria-pressed={settings.warrantyEnabled}
              onClick={() => handleChange("warrantyEnabled", true)}
              icon={<Check className="h-4 w-4" />}
            >
              Enable
            </Button>
            <Button
              type="button"
              variant={!settings.warrantyEnabled ? "primary" : "ghost"}
              aria-pressed={!settings.warrantyEnabled}
              onClick={() => handleChange("warrantyEnabled", false)}
              icon={<X className="h-4 w-4" />}
            >
              Disable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Defaults */}
      <Card>
        <CardHeader title="Receipt Defaults" />

        <CardContent className="space-y-4">
          <Input
            label="Default Receiver Name"
            value={settings.defaultReceiverName}
            onChange={(e) =>
              handleChange("defaultReceiverName", e.target.value)
            }
          />

          <Input
            label="Username"
            value={settings.username}
            readOnly
            aria-readonly="true"
            className="bg-slate-50 text-slate-600 cursor-default"
          />

          <div className="relative">
            <Input
              label="Password"
              type={isPasswordVisible ? "text" : "password"}
              value={settings.password}
              readOnly
              aria-readonly="true"
              className="bg-slate-50 pr-10 text-slate-600 cursor-default"
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              title={isPasswordVisible ? "Hide password" : "Show password"}
              className="absolute right-2 top-[1.85rem] rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

