export const printDocument = () => {
  if (typeof window !== "undefined") {
    window.print();
  }
};
