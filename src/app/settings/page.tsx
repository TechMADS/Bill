
"use client";

import { useState, useEffect } from "react";
import {
  getAuthenticatedSettings,
  saveAuthenticatedSettings,
  BusinessSettings,
} from "@/lib/settings";
import { Save } from "lucide-react";
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

  if (!mounted) return null;

  if (!settings) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || "Unable to load settings."}
      </div>
    );
  }

  const handleChange = (
    field: keyof BusinessSettings,
    value: string
  ) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const saved = await saveAuthenticatedSettings(settings);

      setSettings(saved);
      setSaveStatus("Settings saved successfully!");

      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <PageHeader
        title="Settings"
        action={
          <div className="flex items-center gap-3">
            <Button
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={saving}
              icon={<Save className="h-4 w-4" />}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        }
      />

      {saveStatus && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 text-sm">
          {saveStatus}
        </div>
      )}

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
            onChange={(e) =>
              handleChange("businessName", e.target.value)
            }
          />

          <Input
            label="Owner Name"
            value={settings.ownerName}
            onChange={(e) =>
              handleChange("ownerName", e.target.value)
            }
          />

          <div className="pt-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Address
            </label>

            <textarea
              rows={3}
              value={settings.address}
              onChange={(e) =>
                handleChange("address", e.target.value)
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={settings.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
            />

            <Input
              label="GST Number"
              value={settings.gstNumber}
              onChange={(e) =>
                handleChange("gstNumber", e.target.value)
              }
            />
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
            onChange={(e) =>
              handleChange("username", e.target.value)
            }
          />

          <Input
            label="Password"
            type="text"
            value={settings.password}
            onChange={(e) =>
              handleChange("password", e.target.value)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

