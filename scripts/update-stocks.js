#!/usr/bin/env node
/**
 * KRX KIND에서 KOSPI/KOSDAQ 전 종목을 다운로드해 app/src/data/stocks.ts를 갱신합니다.
 *
 * 사용법:
 *   node scripts/update-stocks.js
 *
 * Node 18+ 필요 (built-in fetch, TextDecoder 사용)
 * 추가 패키지 설치 없음
 */

const fs = require('fs');
const path = require('path');

// 미국 주요 종목은 KRX 대상 외라 수동 관리
const US_STOCKS = [
  { name: '애플', code: 'AAPL' },
  { name: '마이크로소프트', code: 'MSFT' },
  { name: '엔비디아', code: 'NVDA' },
  { name: '알파벳', code: 'GOOGL' },
  { name: '아마존', code: 'AMZN' },
  { name: '메타', code: 'META' },
  { name: '테슬라', code: 'TSLA' },
  { name: '버크셔해서웨이', code: 'BRK.B' },
  { name: '비자', code: 'V' },
  { name: '존슨앤드존슨', code: 'JNJ' },
  { name: '엑슨모빌', code: 'XOM' },
  { name: 'TSMC', code: 'TSM' },
  { name: '삼성전자 ADR', code: 'SSNLF' },
];

/**
 * KIND(한국거래소 전자공시) 종목 목록 다운로드
 * marketType: 'stockMkt' = KOSPI, 'kosdaqMkt' = KOSDAQ
 */
async function fetchKindStocks(marketType) {
  const url = `https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13&marketType=${marketType}`;

  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);

  const buffer = await res.arrayBuffer();
  const html = new TextDecoder('euc-kr').decode(buffer);
  return parseHtmlTable(html);
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
}

function parseHtmlTable(html) {
  // 컬럼 구조: 회사명(0) | 시장구분(1) | 종목코드(2) | 업종(3) | ...
  const stocks = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  let rowMatch;
  let isHeader = true;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    if (isHeader) { isHeader = false; continue; }

    const cells = [];
    cellRegex.lastIndex = 0;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }

    const name = cells[0];
    const code = (cells[2] ?? '').replace(/\s/g, ''); // 종목코드는 3번째 컬럼
    if (name && /^\d{6}$/.test(code)) {
      stocks.push({ name, code });
    }
  }

  return stocks;
}

function escapeStr(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function main() {
  console.log('📥 KOSPI 종목 다운로드 중...');
  const kospi = await fetchKindStocks('stockMkt');
  if (!kospi.length) throw new Error('KOSPI 파싱 결과가 비어있습니다. HTML 구조가 바뀌었을 수 있어요.');
  console.log(`  → ${kospi.length}개`);

  console.log('📥 KOSDAQ 종목 다운로드 중...');
  const kosdaq = await fetchKindStocks('kosdaqMkt');
  if (!kosdaq.length) throw new Error('KOSDAQ 파싱 결과가 비어있습니다. HTML 구조가 바뀌었을 수 있어요.');
  console.log(`  → ${kosdaq.length}개`);

  const date = new Date().toISOString().slice(0, 10);
  const total = kospi.length + kosdaq.length + US_STOCKS.length;

  const lines = [
    `// 자동 생성 — scripts/update-stocks.js (${date})`,
    `// KOSPI ${kospi.length}개 + KOSDAQ ${kosdaq.length}개 + 미국 ${US_STOCKS.length}개 = 총 ${total}개`,
    `// 갱신 방법: node scripts/update-stocks.js`,
    ``,
    `export interface Stock {`,
    `  name: string;`,
    `  code: string;`,
    `}`,
    ``,
    `export const STOCKS: Stock[] = [`,
    `  // KOSPI (${kospi.length}개)`,
    ...kospi.map(s => `  { name: '${escapeStr(s.name)}', code: '${s.code}' },`),
    `  // KOSDAQ (${kosdaq.length}개)`,
    ...kosdaq.map(s => `  { name: '${escapeStr(s.name)}', code: '${s.code}' },`),
    `  // 미국 주요 종목 (수동 관리)`,
    ...US_STOCKS.map(s => `  { name: '${escapeStr(s.name)}', code: '${s.code}' },`),
    `];`,
    ``,
    `export function searchStocks(query: string): Stock[] {`,
    `  if (!query.trim()) return [];`,
    `  const q = query.toLowerCase();`,
    `  return STOCKS.filter(`,
    `    s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)`,
    `  ).slice(0, 5);`,
    `}`,
    ``,
  ];

  const outPath = path.resolve(__dirname, '../app/src/data/stocks.ts');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
  console.log(`✅ ${outPath} 갱신 완료 (총 ${total}개)`);
}

main().catch(err => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
