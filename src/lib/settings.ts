import { getData, storeData } from "./storage";

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  logo: string;
  gstNumber: string;
  defaultReceiverName: string;
}

const defaultSettings: BusinessSettings = {
  businessName: "Acme Corp",
  ownerName: "John Doe",
  phone: "+1 (555) 123-4567",
  address: "123 Business Rd, Tech City, TC 10101",
  logo: "",
  gstNumber: "GSTIN1234567890",
  defaultReceiverName: "Admin",
};

export const getSettings = (): BusinessSettings => getData("settings_v3", defaultSettings);
export const saveSettings = (settings: BusinessSettings) => storeData("settings_v3", settings);
