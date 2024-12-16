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

/**
 * 숫자를 천 단위 구분자와 소수점을 포함한 문자열로 변환
 * @param amount 변환할 숫자
 * @returns 포맷된 문자열 (예: 1000000 -> 1,000,000, 1000000.5 -> 1,000,000.5)
 */
export function formatWithCommas(amount: number): string {
  // 소수점 부분과 정수 부분 분리
  const [integerPart, decimalPart] = amount.toString().split('.')
  
  // 정수 부분에 천 단위 구분자 추가
  const formattedInteger = Number(integerPart).toLocaleString('en-US')
  
  // 소수점 부분이 있는 경우 추가
  if (decimalPart) {
    // 소수점 이하 불필요한 0 제거
    const cleanDecimal = decimalPart.replace(/0+$/, '')
    if (cleanDecimal) {
      return `${formattedInteger}.${cleanDecimal}`
    }
  }
  
  return formattedInteger
} 