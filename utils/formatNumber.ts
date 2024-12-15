export function formatAmount(num: number): string {
  const absNum = Math.abs(num)
  
  // 1,000 미만의 숫자는 그대로 표시
  if (absNum < 1000) {
    return num.toLocaleString()
  }
  
  // 1M (1,000,000) 미만의 숫자는 그대로 표시
  if (absNum < 1_000_000) {
    return num.toLocaleString()
  }
  
  // 1B (1,000,000,000) 미만의 숫자
  if (absNum < 1_000_000_000) {
    const millions = num / 1_000_000
    // 소수점 둘째자리까지 반올림
    const roundedMillions = Math.round(millions * 100) / 100
    return `${roundedMillions}M`
  }
  
  // 1B 이상의 숫자
  const billions = num / 1_000_000_000
  // 소수점 둘째자리까지 반올림
  const roundedBillions = Math.round(billions * 100) / 100
  return `${roundedBillions}B`
} 