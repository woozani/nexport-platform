# Phase 0 검증 스프린트 — 실행 가이드 (W1: HS 3304.99 기초화장품)
기준: [작업지시서 v1.3](../../docs/specs/Phase0_검증스프린트_작업지시서_v1.0.md) · 발송 없음 · 벌크 금지 · 연락처 파일 커밋 금지(.gitignore 적용됨)

## Jay가 할 일 (D1~D3)

### D1 — 준비 (10분)
1. [ImportYeti](https://www.importyeti.com) 무료 가입
2. Hunter.io API 키 확인 (기존 계정 → API 메뉴)
3. (병행 액션) 전용 발송 도메인 구매 — 예: `nexportmail.com` 류. 워밍업 리드타임 확보용, 오늘 사두기만

### D2~3 — ImportYeti 수동 추출 (2~3시간)
1. ImportYeti에서 HS 코드 검색: `330499` (또는 HS Code Explorer → 33류 → 3304.99)
   - 참고 URL 패턴: `importyeti.com/hs-codes/330499-...`
2. **Suppliers 탭에서 South Korea 공급사 기준으로 보거나, 품목 페이지의 U.S. Importers(consignee) 목록**을 연다
3. 최근 12개월 기준 consignee를 [raw/TEMPLATE_bol_extract.csv](raw/TEMPLATE_bol_extract.csv) 형식으로 복사:
   - `company_name` (필수) / `shipment_count_12m` / `last_shipment_date` / `origin_country` / `state` / `city`
   - 목표 **200~500행**. 무료 티어 조회 제한에 걸리면 6개월로 축소하고 리포트에 명기
   - **수동 복사만** — 크롤러·자동화 금지
4. 파일명 `raw/bol_extract_3304_YYYYMMDD.csv` 로 저장 (git에 올라가지 않음 — 정상)

## Claude Code가 할 일 (D3~D5, 데이터 수신 즉시)

```bash
cd engine/phase0/scripts
python3 clean_bol.py                    # 정규화 + 2축 노이즈 필터 → out/companies_normalized.csv + M1 출력
```
- confidence=low 행은 Jay 검수 (오병합·짧은 이름)
- 화장품 회차의 b축(대기업/OEM) 키워드는 `oem_keywords.txt`에서 관리 — 발견되는 대형 리테일·3PL은 계속 추가

## W2 (D6~D10)

```bash
export HUNTER_API_KEY=***              # 절대 커밋 금지
python3 enrich_contacts.py --top 20    # buyer 상위 20개사 건별 조회 (rate limit + 90일 캐시)
python3 enrich_contacts.py --measure --cost-krw-per-lookup 0   # M2/M3 집계 (무료 티어면 0)
```
- 이후 Claude Code가 `REPORT.md` 작성 → M1~M4 + Go/No-Go 판정 요청

## 측정 목표 리마인드
| M1 노이즈(2축 합산) | M2 이메일 적중률 | M3 건당 비용 |
|---|---|---|
| < 50% (필터 후 <10%) | ≥ 60% | ≤ 3,000원 |
