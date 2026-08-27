export function numberToWords(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const convertWholeNumber = (num: number): string => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return '';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + ' Crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + ' Lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + ' Thousand ' : '';
    str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + ' Hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
    return str.trim();
  };

  const rupeesText = convertWholeNumber(rupees);
  let result = `Rupees ${rupeesText}`;

  if (paise > 0) {
    const paiseText = convertWholeNumber(paise);
    result += ` and ${paiseText} Paise`;
  }

  return result + ' Only';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
