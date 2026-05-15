// 股票代码增强：生成带 data 属性的链接，供客户端 tooltip 使用
export interface StockInfo {
  code: string
  region: 'US' | 'HK' | 'A-shares'
  name?: string
  exchange?: string
}

export const STOCK_MAPPINGS: Record<string, StockInfo> = {
  // 美股
  'AAPL': { code: 'AAPL', region: 'US', name: '苹果', exchange: 'NASDAQ' },
  'MSFT': { code: 'MSFT', region: 'US', name: '微软', exchange: 'NASDAQ' },
  'GOOGL': { code: 'GOOGL', region: 'US', name: '谷歌', exchange: 'NASDAQ' },
  'AMZN': { code: 'AMZN', region: 'US', name: '亚马逊', exchange: 'NASDAQ' },
  'TSLA': { code: 'TSLA', region: 'US', name: '特斯拉', exchange: 'NASDAQ' },
  'META': { code: 'META', region: 'US', name: 'Meta', exchange: 'NASDAQ' },
  'NVDA': { code: 'NVDA', region: 'US', name: '英伟达', exchange: 'NASDAQ' },
  'NFLX': { code: 'NFLX', region: 'US', name: '奈飞', exchange: 'NASDAQ' },
  'AMD': { code: 'AMD', region: 'US', name: '超威', exchange: 'NASDAQ' },
  'INTC': { code: 'INTC', region: 'US', name: '英特尔', exchange: 'NASDAQ' },
  'BABA': { code: 'BABA', region: 'US', name: '阿里巴巴', exchange: 'NYSE' },
  'PDD': { code: 'PDD', region: 'US', name: '拼多多', exchange: 'NASDAQ' },
  'NIO': { code: 'NIO', region: 'US', name: '蔚来', exchange: 'NYSE' },

  // 港股
  '00700.HK': { code: '00700', region: 'HK', name: '腾讯控股', exchange: 'HKEX' },
  '00981.HK': { code: '00981', region: 'HK', name: '中芯国际', exchange: 'HKEX' },
  '03690.HK': { code: '03690', region: 'HK', name: '美团', exchange: 'HKEX' },
  '09988.HK': { code: '09988', region: 'HK', name: '阿里巴巴-W', exchange: 'HKEX' },
  '01810.HK': { code: '01810', region: 'HK', name: '小米集团', exchange: 'HKEX' },
  '09618.HK': { code: '09618', region: 'HK', name: '京东集团', exchange: 'HKEX' },
  '02318.HK': { code: '02318', region: 'HK', name: '中国平安', exchange: 'HKEX' },
  '01299.HK': { code: '01299', region: 'HK', name: '友邦保险', exchange: 'HKEX' },

  // A股
  '600519.SS': { code: '600519', region: 'A-shares', name: '贵州茅台', exchange: 'SSE' },
  '600000.SS': { code: '600000', region: 'A-shares', name: '浦发银行', exchange: 'SSE' },
  '000001.SZ': { code: '000001', region: 'A-shares', name: '平安银行', exchange: 'SZSE' },
  '000858.SZ': { code: '000858', region: 'A-shares', name: '五粮液', exchange: 'SZSE' },
  '300750.SZ': { code: '300750', region: 'A-shares', name: '宁德时代', exchange: 'SZSE' },
  '601012.SS': { code: '601012', region: 'A-shares', name: '隆基绿能', exchange: 'SSE' },
}

const HK_CODE_REGEX = /\b(\d{5})\.HK\b/gi
const A_SHARE_REGEX = /\b(\d{6})\.(SS|SZ)\b/gi
const US_CODE_REGEX = /\b([A-Z]{2,5})\b/g
const PURE_NUMBER_CODE_REGEX = /\b(\d{5,6})\b/g

function parseStockCode(code: string): StockInfo | null {
  const upperCode = code.toUpperCase()

  if (STOCK_MAPPINGS[upperCode]) {
    return STOCK_MAPPINGS[upperCode]
  }

  const hkMatch = upperCode.match(/^(\d{5})\.?HK$/)
  if (hkMatch) {
    const c = hkMatch[1]
    if (STOCK_MAPPINGS[`${c}.HK`]) return STOCK_MAPPINGS[`${c}.HK`]
    return { code: c, region: 'HK', exchange: 'HKEX' }
  }

  const aShareMatch = upperCode.match(/^(\d{6})\.?(SS|SZ)$/i)
  if (aShareMatch) {
    const c = aShareMatch[1]
    const key = `${c}.${aShareMatch[2].toUpperCase()}`
    if (STOCK_MAPPINGS[key]) return STOCK_MAPPINGS[key]
    return { code: c, region: 'A-shares', exchange: aShareMatch[2].toUpperCase() === 'SS' ? 'SSE' : 'SZSE' }
  }

  if (/^\d{5}$/.test(code)) {
    if (STOCK_MAPPINGS[`${code}.HK`]) return STOCK_MAPPINGS[`${code}.HK`]
    return { code, region: 'HK', exchange: 'HKEX' }
  }

  if (/^\d{6}$/.test(code)) {
    if (STOCK_MAPPINGS[`${code}.SS`]) return STOCK_MAPPINGS[`${code}.SS`]
    return { code, region: 'A-shares', exchange: 'SSE' }
  }

  return null
}

function generateStockLink(stock: StockInfo, text: string): string {
  const xueqiuCode = stock.region === 'US' ? stock.code : stock.code
  const url = `https://xueqiu.com/S/${xueqiuCode}`

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stock-link" data-stock-code="${stock.code}" data-stock-region="${stock.region}" data-stock-name="${stock.name || ''}" data-stock-exchange="${stock.exchange || ''}">${text}</a>`
}

export function processStockCodes(html: string): string {
  if (!html) return html

  let result = html

  result = result.replace(HK_CODE_REGEX, (match) => {
    const stock = parseStockCode(match)
    return stock ? generateStockLink(stock, match) : match
  })

  result = result.replace(A_SHARE_REGEX, (match) => {
    const stock = parseStockCode(match)
    return stock ? generateStockLink(stock, match) : match
  })

  result = result.replace(US_CODE_REGEX, (match, _capture: string, offset: number, fullText: string) => {
    const before = fullText.substring(0, offset)
    if (before.endsWith('>')) return match
    if (['PDF', 'HTML', 'JSON', 'CSV', 'API', 'URL', 'HTTP', 'HTTPS', 'CSS', 'DOM', 'CLI', 'GUI', 'IDE', 'CPU', 'GPU', 'RAM', 'ROM', 'DNS', 'FTP', 'SSH', 'TLS', 'SSL', 'VPN', 'SQL', 'SDK', 'MVP', 'IPO', 'CEO', 'CFO', 'CTO'].includes(match)) {
      return match
    }
    const stock = parseStockCode(match)
    if (stock) return generateStockLink(stock, match)
    return match
  })

  result = result.replace(PURE_NUMBER_CODE_REGEX, (match, _capture: string, offset: number, fullText: string) => {
    if (/^(19|20)\d{2}$/.test(match)) return match
    const before = fullText.substring(0, offset)
    if (before.endsWith('>')) return match
    const stock = parseStockCode(match)
    if (stock) return generateStockLink(stock, match)
    return match
  })

  return result
}

export function addStockLinksToContent(content: string): string {
  return processStockCodes(content)
}
