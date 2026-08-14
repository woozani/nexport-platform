#!/usr/bin/env python3
"""Phase 0 W2 — Top 20 벤더 건별 조회 (작업지시서 v1.3 D7~8).

하드 제약: 건별 실시간 조회만 (벌크 다운로드 API 금지). 결과는 보존기한 90일 캐시.
벤더: Hunter.io Domain Search (company명 기반). 환경변수 HUNTER_API_KEY 필요.

사용:
  1) clean_bol.py 실행 후 out/companies_normalized.csv 확인
  2) python3 enrich_contacts.py --top 20            # buyer 상위 20개사 조회
  3) python3 enrich_contacts.py --measure --cost-krw-per-lookup 750   # M2/M3 집계
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)
CACHE_PATH = os.path.join(BASE_DIR, 'out', 'contacts_cache.json')
RETENTION_DAYS = 90  # 캐시 보존기한 — "벌크 적재"가 아닌 "이용 이력 보관" 프레임
RATE_LIMIT_SEC = 1.5
PREFERRED_ROLES = ('purchas', 'procure', 'sourcing', 'buyer', 'supply', 'import')


def load_cache() -> dict:
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_cache(cache: dict) -> None:
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def hunter_domain_search(company: str, api_key: str) -> dict:
    qs = urllib.parse.urlencode({'company': company, 'api_key': api_key, 'limit': 10})
    url = f'https://api.hunter.io/v2/domain-search?{qs}'
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.load(resp)


def pick_best_email(data: dict) -> dict | None:
    emails = (data.get('data') or {}).get('emails') or []
    if not emails:
        return None
    def score(e: dict) -> tuple:
        pos = (e.get('position') or '').lower()
        role_hit = any(r in pos for r in PREFERRED_ROLES)
        verified = (e.get('verification') or {}).get('status') == 'valid'
        return (role_hit, verified, e.get('confidence') or 0)
    best = max(emails, key=score)
    return {
        'email': best.get('value'),
        'person': f"{best.get('first_name') or ''} {best.get('last_name') or ''}".strip(),
        'position': best.get('position'),
        'confidence': best.get('confidence'),
        'verification': (best.get('verification') or {}).get('status'),
    }


def cmd_lookup(top_n: int) -> int:
    api_key = os.environ.get('HUNTER_API_KEY')
    if not api_key:
        print('HUNTER_API_KEY 환경변수가 필요합니다: export HUNTER_API_KEY=...', file=sys.stderr)
        return 1
    src = os.path.join(BASE_DIR, 'out', 'companies_normalized.csv')
    if not os.path.exists(src):
        print('먼저 clean_bol.py를 실행하세요.', file=sys.stderr)
        return 1
    with open(src, encoding='utf-8-sig') as f:
        buyers = [r for r in csv.DictReader(f) if r['entity_type'] == 'buyer'][:top_n]

    cache = load_cache()
    now = datetime.now()
    top_out = os.path.join(BASE_DIR, 'out', 'companies_top20.csv')
    with open(top_out, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(['company_id', 'name_normalized', 'domain', 'email', 'person', 'position', 'verification', 'hit'])
        for r in buyers:
            cid, name = r['company_id'], r['name_normalized']
            entry = cache.get(cid)
            if entry and entry.get('expires_at', '') > now.isoformat():
                print(f'[cache] {name}')
            else:
                print(f'[lookup] {name} ...')
                try:
                    data = hunter_domain_search(name, api_key)
                except Exception as exc:  # noqa: BLE001 — 개별 실패는 기록하고 계속
                    data = {'error': str(exc)}
                best = pick_best_email(data) if 'error' not in data else None
                entry = {
                    'name': name,
                    'domain': ((data.get('data') or {}).get('domain') if isinstance(data, dict) else None),
                    'best': best,
                    'error': data.get('error') if isinstance(data, dict) else None,
                    'retrieved_at': now.isoformat(),
                    'expires_at': (now + timedelta(days=RETENTION_DAYS)).isoformat(),
                }
                cache[cid] = entry
                save_cache(cache)
                time.sleep(RATE_LIMIT_SEC)
            best = entry.get('best') or {}
            hit = 'Y' if best.get('email') and best.get('verification') in ('valid', 'accept_all') else 'N'
            w.writerow([cid, name, entry.get('domain') or '', best.get('email') or '', best.get('person') or '',
                        best.get('position') or '', best.get('verification') or '', hit])
    print(f'완료 → {top_out}')
    return 0


def cmd_measure(cost_krw: float) -> int:
    top_out = os.path.join(BASE_DIR, 'out', 'companies_top20.csv')
    if not os.path.exists(top_out):
        print('먼저 --top 조회를 실행하세요.', file=sys.stderr)
        return 1
    with open(top_out, encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f))
    total, hits = len(rows), sum(1 for r in rows if r['hit'] == 'Y')
    print('--- M2 / M3 측정 ---')
    print(f'조회 {total}개사 / 유효 이메일 {hits}건 → M2 적중률 {hits / total:.1%} (Go 기준 ≥ 60%)')
    if hits:
        print(f'총 비용 {cost_krw * total:,.0f}원 → M3 건당 {cost_krw * total / hits:,.0f}원 (Go 기준 ≤ 3,000원)')
    else:
        print('적중 0건 — M3 산출 불가')
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--top', type=int, help='buyer 상위 N개사 조회 (기본 20)')
    ap.add_argument('--measure', action='store_true', help='M2/M3 집계')
    ap.add_argument('--cost-krw-per-lookup', type=float, default=0.0, help='조회 1건당 원화 비용 (무료 티어면 0)')
    args = ap.parse_args()
    if args.measure:
        return cmd_measure(args.cost_krw_per_lookup)
    return cmd_lookup(args.top or 20)


if __name__ == '__main__':
    sys.exit(main())
