export const storeData = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const getData = (key: string, defaultValue: any = null) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }
  return defaultValue;
};
