# Phase 0 검증 스프린트 — REPORT (W1 중간, 2026-08-16)

> 작업지시서 v1.3 기준. W1 = HS 3304.99 (화장품 기타) consignee 추출 + M1 실측.
> 원본 데이터는 하드 제약 #4에 따라 커밋하지 않음 — `raw/bol_extract_3304_20260816.csv` (로컬 252행).

## W1 실행 요약

| 항목 | 계획 (지시서) | 실제 |
|---|---|---|
| 소스 | ImportYeti 수동 추출 | ImportYeti — Chrome 로그인 세션 경유 추출 (Claude 보조, 수동 추출 대체) |
| 방법 | HS 페이지에서 수동 복사 | HS 3304.99 페이지의 한국 공급사 24곳 식별 → 각 공급사 페이지의 고객사(consignee) 테이블 파싱 |
| 행수 | 200~500행 | **252행** (미국 consignee, 공급사별 중복 포함) |
| 리드타임 | D2~3 (수일) | 실작업 약 1시간 |

### 추출 방법론 메모
- ImportYeti HS 코드 페이지의 supplier 리스트를 국가=South Korea로 필터 → 프리로드된 24개 공급사 확보 (포워더 2곳 포함: Hanjin Transportation, Eunsan Shipping)
- 각 supplier 페이지 SSR 페이로드의 `vendor_table`(고객사 테이블)에서 미국(US) consignee만 추출: 회사명 / 주소(city·state) / 12개월 선적수
- `last_shipment_date`는 이 경로에서 미제공 → 공란 (W2 또는 BOL 상세에서 보완 가능)
- 포워더 공급사 페이지 경유 행(77행)은 HS 미확인이므로 notes에 `via_forwarder_page(HS미확인)` 플래그

## M1 실측 — 노이즈 비율 (clean_bol.py, 2축)

**전체 252행 (포워더 페이지 경유 포함):**

| 지표 | 값 |
|---|---|
| 정규화 회사 수 | 218개 |
| a축 포워더/3PL | 42개 (19.3%) |
| b축 대기업/OEM | 19개 (8.7%) |
| **합산 노이즈** | **28.0%** (Go 기준: < 50%) |
| buyer(발굴 대상) | 157개 (72.0%) |
| 검수 큐(low confidence) | 7개 — D5 Jay 수동 확인 대상 |

**HS 확인분 175행만 (포워더 페이지 경유 제외):**

| 지표 | 값 |
|---|---|
| 정규화 회사 수 | 152개 |
| a축 포워더/3PL | 7개 (4.6%) |
| b축 대기업/OEM | 17개 (11.2%) |
| **합산 노이즈** | **15.8%** |
| buyer(발굴 대상) | 128개 (84.2%) |

### M1 판정 (잠정)
- 두 기준 모두 Go 임계(합산 < 50%)를 큰 폭으로 통과. **HS 확인분 기준 노이즈 15.8% = 데이터 품질 양호.**
- b축(대기업/리테일: Costco·Ulta·Sephora·Estee Lauder 계열 등)이 상대적으로 큰 비중 — SME 타깃 필터가 유효하게 작동함을 확인.
- buyer 풀 128~157개는 W2(이메일 조회 20개사 샘플)에 충분.

## 다음 단계

1. **D5 검수 큐** — confidence=low 7건 Jay 수동 확인 (`out/companies_normalized.csv`)
2. **W2 이메일 조회** — buyer 상위 20개사 × Hunter 건별 조회 → 적중률·건당 비용 측정. **Hunter API 키 필요 (Jay)**
3. REPORT 최종화 — M2~M4 채운 후 Go/No-Go 판정
4. (병행, Jay) 발송 도메인 구매 — 워밍업 4~6주 리드타임

## 재현 방법

```
# raw CSV가 로컬에 있는 상태에서
python3 scripts/clean_bol.py --input raw/bol_extract_3304_20260816.csv --outdir out
```
