export const money = (centavos: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
    centavos / 100,
  );
export const pesoInput = (centavos: number | null | undefined) =>
  centavos === null || centavos === undefined
    ? ''
    : (centavos / 100).toFixed(2);
export function centavosFromInput(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value))
    throw new Error('Enter a peso amount with at most two decimal places.');
  const [pesos, decimal = ''] = value.split('.');
  const result = Number(pesos) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(result))
    throw new Error('This amount is too large.');
  return result;
}
