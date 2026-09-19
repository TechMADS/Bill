import { getData, storeData } from "./storage";

export interface BusinessSettings {
  businessName: string;
  businessLegalName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  stateCode: string;
  logo: string;
  gstNumber: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  authorizedSignatory: string;
  defaultReceiverName: string;
}

const defaultSettings: BusinessSettings = {
  businessName: "Acme Corp",
  businessLegalName: "",
  ownerName: "John Doe",
  phone: "+1 (555) 123-4567",
  email: "",
  address: "123 Business Rd, Tech City, TC 10101",
  state: "",
  stateCode: "",
  logo: "",
  gstNumber: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  authorizedSignatory: "",
  defaultReceiverName: "Admin",
};

export const getSettings = (): BusinessSettings => ({
  ...defaultSettings,
  ...getData("settings_v3", {}),
});
export const saveSettings = (settings: BusinessSettings) => storeData("settings_v3", settings);
