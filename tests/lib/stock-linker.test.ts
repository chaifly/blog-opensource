import { describe, expect, it } from 'vitest'
import { processStockCodes, STOCK_MAPPINGS } from '@/lib/stock-linker'

describe('stock-linker', () => {
  describe('STOCK_MAPPINGS', () => {
    it('contains known US stocks', () => {
      expect(STOCK_MAPPINGS['AAPL']).toMatchObject({ code: 'AAPL', region: 'US' })
      expect(STOCK_MAPPINGS['TSLA']).toMatchObject({ code: 'TSLA', region: 'US' })
      expect(STOCK_MAPPINGS['NVDA']).toMatchObject({ code: 'NVDA', region: 'US' })
    })

    it('contains known HK stocks', () => {
      expect(STOCK_MAPPINGS['00700.HK']).toMatchObject({ code: '00700', region: 'HK', name: '腾讯控股' })
      expect(STOCK_MAPPINGS['03690.HK']).toMatchObject({ code: '03690', region: 'HK', name: '美团' })
    })

    it('contains known A-share stocks', () => {
      expect(STOCK_MAPPINGS['600519.SS']).toMatchObject({ code: '600519', region: 'A-shares', name: '贵州茅台' })
      expect(STOCK_MAPPINGS['300750.SZ']).toMatchObject({ code: '300750', region: 'A-shares', name: '宁德时代' })
    })
  })

  describe('processStockCodes', () => {
    it('returns empty string for null/undefined input', () => {
      expect(processStockCodes('')).toBe('')
    })

    it('converts known US stock ticker to link', () => {
      const result = processStockCodes('买入 AAPL 股票')
      expect(result).toContain('href="https://xueqiu.com/S/AAPL"')
      expect(result).toContain('data-stock-code="AAPL"')
      expect(result).toContain('data-stock-region="US"')
      expect(result).toContain('data-stock-name="苹果"')
      expect(result).toContain('class="stock-link"')
      expect(result).toContain('>AAPL<')
    })

    it('converts HK stock code with .HK suffix', () => {
      const result = processStockCodes('看好 00700.HK')
      expect(result).toContain('data-stock-code="00700"')
      expect(result).toContain('data-stock-region="HK"')
      expect(result).toContain('data-stock-name="腾讯控股"')
    })

    it('converts A-share stock code with .SS suffix', () => {
      const result = processStockCodes('贵州茅台 600519.SS')
      expect(result).toContain('data-stock-code="600519"')
      expect(result).toContain('data-stock-region="A-shares"')
      expect(result).toContain('data-stock-name="贵州茅台"')
    })

    it('converts A-share stock code with .SZ suffix', () => {
      const result = processStockCodes('宁德时代 300750.SZ')
      expect(result).toContain('data-stock-code="300750"')
      expect(result).toContain('data-stock-region="A-shares"')
    })

    it('does not convert common acronyms/words that look like tickers', () => {
      const commonWords = ['CEO', 'CPU', 'GPU', 'API', 'URL', 'HTTP', 'HTTPS', 'CSS', 'DNS', 'VPN', 'RAM', 'ROM']
      for (const word of commonWords) {
        const result = processStockCodes(word)
        expect(result, `${word} should not be converted`).not.toContain('data-stock-code')
      }
    })

    it('does not convert numbers that look like years', () => {
      const result = processStockCodes('成立于 1999 年，2024 年增长')
      expect(result).not.toContain('data-stock-code')
    })

    it('does not convert codes already inside HTML tags', () => {
      const result = processStockCodes('<a href="/test">AAPL</a>')
      // AAPL 前面是 > 闭合标签，shouldNotConvert 逻辑应跳过
      expect(result).toBe('<a href="/test">AAPL</a>')
    })

    it('handles multiple stock codes in the same text', () => {
      const result = processStockCodes('对比 AAPL 和 00700.HK')
      expect(result).toContain('data-stock-code="AAPL"')
      expect(result).toContain('data-stock-code="00700"')
    })

    it('generates correct Xueqiu URLs for each region', () => {
      const usResult = processStockCodes('买入 MSFT')
      expect(usResult).toContain('href="https://xueqiu.com/S/MSFT"')

      const hkResult = processStockCodes('买入 00700.HK')
      expect(hkResult).toContain('href="https://xueqiu.com/S/00700"')
    })

    it('handles 5-digit bare numbers as possible HK stocks', () => {
      const result = processStockCodes('代码 00700')
      expect(result).toContain('data-stock-code="00700"')
      expect(result).toContain('data-stock-region="HK"')
    })

    it('handles 6-digit bare numbers as possible A-share stocks', () => {
      const result = processStockCodes('贵州茅台 600519')
      expect(result).toContain('data-stock-code="600519"')
      expect(result).toContain('data-stock-region="A-shares"')
    })
  })
})
