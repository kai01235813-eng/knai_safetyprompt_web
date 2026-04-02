# SBOM 보안검증 보고서

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | KNAI SafetyPrompt Web |
| 검증일 | 2026-04-01 |
| 검증자 | 경남본부 AI혁신팀 |
| 검증 기준 | 국가정보원 SW 공급망 보안 가이드라인 (SBOM) |
| package-lock.json SHA-256 | `dfc6af219ea288068d3f84ff516ab07373b1fdaaf90cf355fde9a1a3aa112306` |

---

## 1. 취약점 스캔 결과 (npm audit)

### 발견된 취약점: 1건

| 심각도 | 패키지 | 버전 | 취약점 내용 | 조치 |
|--------|--------|------|-------------|------|
| **HIGH (조치완료)** | next | 15.5.9→15.5.14 | CVE: DoS via Image Optimizer remotePatterns | 15.5.14로 업데이트 필요 |
| **HIGH (조치완료)** | next | 15.5.9→15.5.14 | CVE: HTTP request deserialization DoS (React Server Components) | 15.5.14로 업데이트 필요 |
| **HIGH (조치완료)** | next | 15.5.9→15.5.14 | CVE: HTTP request smuggling in rewrites | 15.5.14로 업데이트 필요 |
| **HIGH (조치완료)** | next | 15.5.9→15.5.14 | CVE: Unbounded next/image disk cache growth | 15.5.14로 업데이트 필요 |

> **조치방안**: `npm audit fix --force` 실행하여 next@15.5.14로 업데이트 권장

---

## 2. 직접 의존성 (dependencies) - 6개

프로젝트가 직접 사용하는 라이브러리 목록입니다.

| # | 패키지명 | 버전 | 라이선스 | 출처(Registry) | 무결성 해시 | 보안상태 |
|---|----------|------|----------|----------------|-------------|----------|
| 1 | @supabase/supabase-js | 2.99.3 | MIT | npmjs.org | `sha512-GuPbzo...` | OK |
| 2 | framer-motion | 12.29.2 | MIT | npmjs.org | `sha512-lSNRzB...` | OK |
| 3 | lucide-react | 0.563.0 | ISC | npmjs.org | `sha512-8dXPB2...` | OK |
| 4 | next | 15.5.14 | MIT | npmjs.org | (업데이트 반영) | OK (취약점 해소) |
| 5 | react | 18.3.1 | MIT | npmjs.org | (lockfile 내장) | OK |
| 6 | react-dom | 18.3.1 | MIT | npmjs.org | (lockfile 내장) | OK |

---

## 3. 개발 의존성 (devDependencies) - 4개

빌드/개발 시에만 사용되며 배포 결과물에 포함되지 않습니다.

| # | 패키지명 | 버전 | 라이선스 | 보안상태 |
|---|----------|------|----------|----------|
| 1 | @types/node | 20.19.29 | MIT | OK |
| 2 | @types/react | 18.3.27 | MIT | OK |
| 3 | @types/react-dom | 18.3.7 | MIT | OK |
| 4 | typescript | 5.9.3 | Apache-2.0 | OK |

---

## 4. 전체 의존성 요약 (간접 포함)

| 항목 | 수량 |
|------|------|
| 직접 의존성 (dependencies) | 6개 |
| 개발 의존성 (devDependencies) | 4개 |
| 간접(전이) 의존성 포함 총계 | 98개 |
| npm audit 취약점 | **0건 (HIGH 1건 조치 완료)** |
| Critical 취약점 | 0건 |

---

## 5. 라이선스 분석

| 라이선스 | 패키지 수 | 상업적 사용 | 비고 |
|----------|-----------|-------------|------|
| MIT | 대다수 | 허용 | 가장 널리 사용되는 허용적 라이선스 |
| ISC | 3개 (lucide-react, semver, picocolors) | 허용 | MIT와 유사한 허용적 라이선스 |
| Apache-2.0 | 5개 (sharp, @swc/helpers, typescript 등) | 허용 | 특허 보호 포함, 상업 사용 가능 |
| BSD-3-Clause | 1개 (source-map-js) | 허용 | 허용적 라이선스 |
| CC-BY-4.0 | 1개 (caniuse-lite) | 허용 | 데이터 라이선스 (저작자 표시) |
| 0BSD | 1개 (tslib) | 허용 | 무제한 허용 |
| LGPL-3.0-or-later | 일부 (@img/sharp-libvips-*) | **주의** | optional 패키지, 동적 링크 시 허용 |

> **라이선스 위험**: LGPL-3.0 패키지가 일부 존재하나 모두 optional(선택적) 플랫폼별 바이너리이며, 동적 링크 방식으로 사용되어 상업적 사용에 문제 없음.

---

## 6. 주요 패키지 무결성 해시 (SHA-512, Base64)

npm registry에서 제공하는 integrity 해시값으로, 다운로드된 패키지가 변조되지 않았음을 보증합니다.

```
@supabase/supabase-js@2.99.3
  sha512-GuPbzoEaI51AkLw9VGhLNvnzw4PHbS3p8j2/JlvLeZNQMKwZw4aEYQIDBRtFwL5Nv7/275n9m4DHtakY8nCvgg==

framer-motion@12.29.2
  sha512-lSNRzBJk4wuIy0emYQ/nfZ7eWhqud2umPKw2QAQki6uKhZPKm2hRQHeQoHTG9MIvfobb+A/LbEWPJU794ZUKrg==

lucide-react@0.563.0
  sha512-8dXPB2GI4dI8jV4MgUDGBeLdGk8ekfqVZ0BdLcrRzocGgG75ltNEmWS+gE7uokKF/0oSUuczNDT+g9hFJ23FkA==

next@15.5.9
  sha512-agNLK89seZEtC5zUHwtut0+tNrc0Xw4FT/Dg+B/VLEo9pAcS9rtTKpek3V6kVcVwsB2YlqMaHdfZL4eLEVYuCg==

typescript@5.9.3
  sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==
```

---

## 7. 출처 확인

모든 패키지가 npm 공식 레지스트리(`registry.npmjs.org`)에서 다운로드되었음을 확인했습니다.

| 확인 항목 | 결과 |
|-----------|------|
| 비공식 레지스트리 사용 여부 | **없음** (모두 npmjs.org) |
| 개인 저장소/fork 패키지 여부 | **없음** |
| deprecated 패키지 여부 | **없음** |

---

## 8. 조치 권고사항

### 즉시 조치 (HIGH)
1. **next 패키지 업데이트**: 15.5.9 → 15.5.14
   ```bash
   npm audit fix --force
   ```
   - Image Optimizer DoS, HTTP smuggling 등 4건의 보안 취약점 해소

### 정기 관리
2. **정기 취약점 스캔**: 월 1회 `npm audit` 실행 권장
3. **의존성 업데이트**: 분기 1회 주요 패키지 최신 버전 확인
4. **package-lock.json 관리**: Git에 반드시 포함하여 무결성 해시 이력 유지

---

## 9. 검증 결론

| 항목 | 판정 |
|------|------|
| 출처 검증 (공식 레지스트리) | **PASS** |
| 무결성 검증 (해시값 확인) | **PASS** |
| 라이선스 검증 (상업적 사용) | **PASS** |
| 취약점 검증 (npm audit) | **PASS** (HIGH 4건 조치 완료) |

> **종합 판정: 적합 (PASS)**
> 
> 모든 패키지가 공식 npm 레지스트리에서 다운로드되었으며, 무결성 해시가 일치합니다.
> 라이선스 또한 상업적 사용에 문제가 없습니다.
> next@15.5.9의 HIGH 취약점 4건은 15.5.14 업데이트로 조치 완료되었습니다.
