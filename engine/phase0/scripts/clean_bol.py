#!/usr/bin/env python3
"""Phase 0 W1 — BOL 수동 추출본 정제 스크립트 (작업지시서 v1.3 D3~4).

입력:  raw/bol_extract_*.csv (ImportYeti 수동 추출, TEMPLATE 헤더 준수)
출력:  out/companies_normalized.csv + M1(2축 노이즈) 측정 리포트(stdout)

파이프라인: ① 회사명 정규화 → ② 중복·표기변형 병합(fuzzy) → ③ 2축 노이즈 필터
            (a: 포워더/3PL  b: 대기업/OEM/대형 리테일) → ④ entity_type·confidence 부여

의존성 없음(표준 라이브러리만). LLM 배치 판별은 Phase 0에서는 검수 큐(confidence=low)로 대체.
사용:  python3 clean_bol.py [--input raw/bol_extract_3304_20260814.csv] [--outdir out]
"""
from __future__ import annotations

import argparse
import csv
import difflib
import glob
import os
import re
import sys
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)

# 법인 접미사 — 정규화 시 제거 (병합 키 생성용. 원본은 name_raw에 보존)
SUFFIXES = [
    'INCORPORATED', 'CORPORATION', 'COMPANY', 'LIMITED', 'INTERNATIONAL',
    'CO LTD', 'CO., LTD', 'CO.,LTD', 'INC', 'LLC', 'CORP', 'LTD', 'CO', 'USA', 'GROUP',
]
FUZZY_THRESHOLD = 0.92  # 표기 변형 병합 임계 — 오병합 시 name_raw 이력으로 롤백 가능


def load_keywords(filename: str) -> list[str]:
    path = os.path.join(SCRIPT_DIR, filename)
    words: list[str] = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                words.append(line.upper())
    return words


def normalize_name(raw: str) -> str:
    s = raw.upper().strip()
    s = re.sub(r'[^A-Z0-9&\s]', ' ', s)  # 구두점 제거
    s = re.sub(r'\s+', ' ', s).strip()
    changed = True
    while changed:  # "ABC CO LTD" → "ABC" 처럼 다중 접미사 반복 제거
        changed = False
        for suf in SUFFIXES:
            if s.endswith(' ' + suf):
                s = s[: -len(suf) - 1].strip()
                changed = True
    return s


def classify(name_norm: str, forwarders: list[str], oems: list[str]) -> str:
    # 단어 경계 매칭 — "SK"가 "SKIN"에, "CO"가 "COSMETICS"에 부분 일치하는 오분류 방지
    def hits(keywords: list[str]) -> bool:
        return any(re.search(r'\b' + re.escape(kw) + r'\b', name_norm) for kw in keywords)
    if hits(forwarders):
        return 'forwarder'
    if hits(oems):
        return 'oem_large'
    return 'buyer'


def read_rows(paths: list[str]) -> list[dict]:
    rows: list[dict] = []
    for path in paths:
        with open(path, encoding='utf-8-sig') as f:
            for row in csv.DictReader(f):
                name = (row.get('company_name') or '').strip()
                if not name or name.startswith('EXAMPLE_DELETE_ME'):
                    continue
                rows.append(row)
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', help='입력 CSV (기본: raw/bol_extract_*.csv 전체)')
    ap.add_argument('--outdir', default=os.path.join(BASE_DIR, 'out'))
    args = ap.parse_args()

    paths = [args.input] if args.input else sorted(glob.glob(os.path.join(BASE_DIR, 'raw', 'bol_extract_*.csv')))
    if not paths:
        print('입력 파일 없음 — raw/bol_extract_*.csv 를 배치하세요 (TEMPLATE_bol_extract.csv 참조)', file=sys.stderr)
        return 1

    forwarders = load_keywords('forwarder_keywords.txt')
    oems = load_keywords('oem_keywords.txt')
    rows = read_rows(paths)
    if not rows:
        print('유효 행 없음 (EXAMPLE_DELETE_ME 행은 무시됩니다)', file=sys.stderr)
        return 1

    # ①② 정규화 + 정확 일치 병합
    merged: dict[str, dict] = {}
    for row in rows:
        raw_name = row['company_name'].strip()
        key = normalize_name(raw_name)
        rec = merged.setdefault(key, {
            'name_raws': [], 'shipments': 0, 'last_date': '', 'origins': set(), 'state': '', 'city': '', 'fuzzy_merged': False,
        })
        rec['name_raws'].append(raw_name)
        try:
            rec['shipments'] += int(float(row.get('shipment_count_12m') or 0))
        except ValueError:
            pass
        d = (row.get('last_shipment_date') or '').strip()
        if d > rec['last_date']:
            rec['last_date'] = d
        if row.get('origin_country'):
            rec['origins'].add(row['origin_country'].strip())
        rec['state'] = rec['state'] or (row.get('state') or '').strip()
        rec['city'] = rec['city'] or (row.get('city') or '').strip()

    # ② fuzzy 병합 (임계 이상 유사 키 통합)
    keys = sorted(merged.keys(), key=lambda k: -merged[k]['shipments'])
    canonical: dict[str, str] = {}
    for k in keys:
        if k in canonical:
            continue
        canonical[k] = k
        for other in keys:
            if other in canonical or other == k:
                continue
            if difflib.SequenceMatcher(None, k, other).ratio() >= FUZZY_THRESHOLD:
                canonical[other] = k
    final: dict[str, dict] = {}
    for k, canon in canonical.items():
        src = merged[k]
        dst = final.setdefault(canon, {
            'name_raws': [], 'shipments': 0, 'last_date': '', 'origins': set(), 'state': '', 'city': '', 'fuzzy_merged': False,
        })
        if canon != k:
            dst['fuzzy_merged'] = True
        dst['name_raws'] += src['name_raws']
        dst['shipments'] += src['shipments']
        dst['last_date'] = max(dst['last_date'], src['last_date'])
        dst['origins'] |= src['origins']
        dst['state'] = dst['state'] or src['state']
        dst['city'] = dst['city'] or src['city']

    # ③④ 분류 + 출력
    os.makedirs(args.outdir, exist_ok=True)
    out_path = os.path.join(args.outdir, 'companies_normalized.csv')
    counts: dict[str, int] = defaultdict(int)
    with open(out_path, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(['company_id', 'name_normalized', 'name_raw', 'entity_type', 'hs_codes',
                    'shipment_count_12m', 'last_shipment_date', 'origin_countries', 'state', 'city', 'confidence'])
        for i, (canon, rec) in enumerate(sorted(final.items(), key=lambda kv: -kv[1]['shipments']), 1):
            etype = classify(canon, forwarders, oems)
            counts[etype] += 1
            confidence = 'low' if (rec['fuzzy_merged'] or len(canon) <= 3) else 'high'
            w.writerow([
                f'c{i:04d}', canon, ' | '.join(dict.fromkeys(rec['name_raws'])), etype, '3304.99',
                rec['shipments'], rec['last_date'], ';'.join(sorted(rec['origins'])), rec['state'], rec['city'], confidence,
            ])

    total = sum(counts.values())
    fwd, oem, buyer = counts['forwarder'], counts['oem_large'], counts['buyer']
    print(f'입력 {len(rows)}행 → 정규화 회사 {total}개 (출력: {out_path})')
    print('--- M1 노이즈 비율 (2축) ---')
    print(f'  a축 포워더/3PL : {fwd}개 ({fwd / total:.1%})')
    print(f'  b축 대기업/OEM : {oem}개 ({oem / total:.1%})')
    print(f'  합산 노이즈    : {(fwd + oem) / total:.1%}  (Go 기준: 합산 < 50%)')
    print(f'  buyer(발굴 대상): {buyer}개 ({buyer / total:.1%})')
    low = sum(1 for canon, rec in final.items() if rec['fuzzy_merged'] or len(canon) <= 3)
    print(f'검수 큐(confidence=low): {low}개 — Jay 수동 확인 대상 (D5)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
