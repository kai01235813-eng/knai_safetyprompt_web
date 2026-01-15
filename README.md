# KEPCO 프롬프트 보안 검증 웹 서비스

한국전력공사 생성형AI 프롬프트 보안 검증 시스템의 웹 버전입니다.

## 🚀 빠른 시작

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

필수 환경 변수 설정:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `NEXTAUTH_SECRET`: 인증 비밀키 (랜덤 문자열)

### 3. Python 파일 복사

기존 프로젝트의 Python 파일들을 `python/` 디렉토리로 복사:

```bash
# Windows
copy "..\security_prompt\prompt_security_validator.py" "python\"
copy "..\security_prompt\image_analyzer.py" "python\"

# 또는 수동으로 복사
```

필요한 파일:
- `prompt_security_validator.py`
- `image_analyzer.py` (선택)

### 4. 데이터베이스 설정

Prisma 마이그레이션:

```bash
npx prisma generate
npx prisma db push
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 📁 프로젝트 구조

```
security-prompt-web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
│       ├── validate/      # 검증 API
│       └── admin/         # 관리자 API
├── components/            # React 컴포넌트
│   ├── validator/         # 검증 관련 컴포넌트
│   ├── admin/             # 관리자 컴포넌트
│   └── ui/                # 기본 UI 컴포넌트
├── lib/                   # 라이브러리
│   ├── validator.ts       # Python 연동
│   ├── db.ts              # DB 연결
│   └── utils.ts           # 유틸리티
├── python/                # Python 검증 엔진
│   ├── validate_api.py    # API 엔드포인트
│   ├── prompt_security_validator.py
│   └── image_analyzer.py
├── prisma/                # Prisma ORM
│   └── schema.prisma      # DB 스키마
└── public/                # 정적 파일
```

---

## 🔧 주요 기능

### 사용자 기능
- ✅ 텍스트 프롬프트 검증
- ✅ 민감정보 자동 마스킹 (`***`)
- ✅ 필터링된 프롬프트 복사
- 🚧 이미지 OCR 검증 (준비 중)

### 관리자 기능 (준비 중)
- 📊 실시간 대시보드
- 📋 검증 로그 조회
- 📈 통계 분석
- 📤 감사 자료 내보내기

---

## 🗄️ 데이터베이스 스키마

### validation_logs
검증 이력 저장

### admin_users
관리자 계정

### statistics_cache
통계 캐시 (성능 최적화)

### system_config
시스템 설정

상세 스키마는 `prisma/schema.prisma` 참조

---

## 🚀 배포

### Vercel 배포

1. Vercel 프로젝트 생성
```bash
npm i -g vercel
vercel
```

2. 환경 변수 설정
   - Vercel 대시보드에서 환경 변수 추가
   - `.env.local`의 모든 변수 복사

3. 배포
```bash
vercel --prod
```

### Supabase 데이터베이스

1. https://supabase.com 에서 프로젝트 생성
2. Database URL 복사
3. Vercel 환경 변수에 추가:
   - `DATABASE_URL`
   - `DIRECT_URL`

---

## 📊 관리자 접속

관리자 페이지: `/admin`

기본 계정:
- Username: `admin`
- Password: 환경 변수 설정 필요

**⚠️ 프로덕션에서는 반드시 비밀번호를 변경하세요!**

---

## 🔐 보안

### 데이터 보호
- 원본 프롬프트: DB 저장 (암호화 권장)
- 필터링 프롬프트: 평문 저장 (감사용)
- 민감정보: `***` 마스킹

### 접근 제어
- 관리자 페이지: NextAuth.js 인증
- API Rate Limiting (준비 중)
- CORS 설정

---

## 🧪 테스트

### 로컬 테스트
```bash
# 검증 API 테스트
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"테스트 프롬프트입니다"}'
```

### Python 엔진 테스트
```bash
cd python
python validate_api.py
# stdin으로 JSON 입력: {"prompt":"test"}
```

---

## 📝 개발 가이드

### 새 API 엔드포인트 추가
1. `app/api/` 디렉토리에 폴더 생성
2. `route.ts` 파일 작성
3. `lib/` 라이브러리 함수 활용

### 새 컴포넌트 추가
1. `components/` 디렉토리에 컴포넌트 생성
2. TypeScript + Tailwind CSS 사용
3. shadcn/ui 컴포넌트 활용

### DB 스키마 변경
1. `prisma/schema.prisma` 수정
2. `npx prisma generate` 실행
3. `npx prisma db push` 또는 마이그레이션

---

## 🐛 문제 해결

### Python 실행 오류
```bash
# Python 설치 확인
python --version

# Python 경로 확인
where python  # Windows
which python  # Linux/Mac
```

### DB 연결 오류
- `DATABASE_URL` 환경 변수 확인
- PostgreSQL 서버 실행 확인
- 네트워크 연결 확인

### 빌드 오류
```bash
# node_modules 재설치
rm -rf node_modules
npm install

# 캐시 정리
rm -rf .next
npm run build
```

---

## 📞 지원

- 기술 문의: dev@kepco.co.kr
- 보안 문의: security@kepco.co.kr
- GitHub Issues: (프로젝트 URL)

---

## 📜 라이선스

© 2026 한국전력공사. All rights reserved.

---

## 🎯 로드맵

### Phase 1 (완료)
- [x] Next.js 프로젝트 구조
- [x] 기본 UI
- [x] 검증 API
- [x] DB 스키마

### Phase 2 (진행 중)
- [ ] 관리자 인증
- [ ] 대시보드
- [ ] 로그 조회

### Phase 3 (예정)
- [ ] 통계 분석
- [ ] 감사 자료 내보내기
- [ ] 이미지 OCR

### Phase 4 (예정)
- [ ] 사용자 인증 (선택)
- [ ] 알림 기능
- [ ] 성능 최적화
