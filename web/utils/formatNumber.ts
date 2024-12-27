export function formatAmount(num: number): string {
  const absNum = Math.abs(num)
  
  if (absNum < 1000) {
    return num.toLocaleString()
  }
  
  if (absNum < 1_000_000) {
    return num.toLocaleString()
  }
  
  if (absNum < 1_000_000_000) {
    const millions = num / 1_000_000
    const roundedMillions = Math.round(millions * 100) / 100
    return `${roundedMillions}M`
  }
  
  const billions = num / 1_000_000_000
  const roundedBillions = Math.round(billions * 100) / 100
  return `${roundedBillions}B`
}

export function formatWithCommas(amount: number): string {
  const [integerPart, decimalPart] = amount.toString().split('.')
  const formattedInteger = Number(integerPart).toLocaleString('en-US')
  if (decimalPart) {
    const cleanDecimal = decimalPart.replace(/0+$/, '')
    if (cleanDecimal) {
      return `${formattedInteger}.${cleanDecimal}`
    }
  }
  
  return formattedInteger
} 