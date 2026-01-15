# 웹 프로젝트 설정 가이드

## 🎯 전체 프로젝트가 생성되었습니다!

지금까지 다음 파일들이 생성되었습니다:

### ✅ 생성된 파일

#### 프로젝트 설정
- `package.json` - Node.js 패키지 설정
- `tsconfig.json` - TypeScript 설정
- `next.config.js` - Next.js 설정
- `tailwind.config.ts` - Tailwind CSS 설정
- `.env.example` - 환경 변수 예시

#### 데이터베이스
- `prisma/schema.prisma` - DB 스키마

#### 애플리케이션
- `app/layout.tsx` - 루트 레이아웃
- `app/globals.css` - 전역 스타일
- `app/page.tsx` - 메인 페이지
- `app/api/validate/route.ts` - 검증 API

#### 라이브러리
- `lib/validator.ts` - Python 검증 엔진 연동
- `lib/db.ts` - 데이터베이스 연결

#### Python 엔진
- `python/validate_api.py` - Python API 엔드포인트

---

## 📝 다음 단계

### 1단계: 나머지 컴포넌트 생성 필요

아직 생성되지 않은 컴포넌트들:
- `components/layout/Header.tsx`
- `components/validator/PromptInput.tsx`
- `components/validator/ValidationResult.tsx`
- `components/validator/FilteredPrompt.tsx`
- `components/ui/*` (shadcn/ui 컴포넌트)

### 2단계: Python 파일 복사

기존 프로젝트의 Python 파일을 복사:

```bash
# Windows 명령 프롬프트에서
cd e:\1.개발\security-prompt-web

# Python 디렉토리 생성 (이미 생성됨)
# mkdir python

# 파일 복사
copy "..\security_prompt\prompt_security_validator.py" "python\"
```

### 3단계: 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local

# .env.local 파일을 열어서 수정
# - DATABASE_URL: Supabase URL
# - NEXTAUTH_SECRET: 랜덤 문자열
```

### 4단계: 패키지 설치

```bash
npm install
```

### 5단계: 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# DB 스키마 적용 (Supabase 연결 필요)
npx prisma db push
```

### 6단계: 개발 서버 실행

```bash
npm run dev
```

---

## 🚀 빠른 설정 (자동)

아래 명령어들을 순서대로 실행:

```bash
# 1. 프로젝트 디렉토리로 이동
cd e:\1.개발\security-prompt-web

# 2. Python 파일 복사
copy "..\security_prompt\prompt_security_validator.py" "python\"

# 3. 환경 변수 복사
copy .env.example .env.local

# 4. 패키지 설치
npm install

# 5. Prisma 설정 (DB URL 설정 후)
# npx prisma generate
# npx prisma db push

# 6. 개발 서버 실행
# npm run dev
```

---

## 🗄️ Supabase 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `kepco-security-validator`
   - Database Password: 안전한 비밀번호
   - Region: Northeast Asia (Seoul)

### 2. Database URL 복사

1. 프로젝트 대시보드에서 "Settings" → "Database"
2. "Connection string" 섹션에서 URL 복사
3. `.env.local` 파일에 붙여넣기:

```env
DATABASE_URL="postgresql://postgres.[프로젝트ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[프로젝트ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

### 3. Prisma 마이그레이션

```bash
npx prisma db push
```

---

## 🔐 NextAuth 비밀키 생성

```bash
# OpenSSL 사용 (Git Bash 또는 Linux)
openssl rand -base64 32

# 또는 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

생성된 키를 `.env.local`에 추가:
```env
NEXTAUTH_SECRET="생성된-비밀키"
```

---

## 📦 아직 생성되지 않은 파일들

### 우선순위 높음

1. **UI 컴포넌트** (필수)
   - `components/ui/card.tsx`
   - `components/ui/button.tsx`
   - `components/ui/tabs.tsx`
   - `components/ui/input.tsx`
   - `components/ui/textarea.tsx`

2. **검증 컴포넌트** (필수)
   - `components/layout/Header.tsx`
   - `components/validator/PromptInput.tsx`
   - `components/validator/ValidationResult.tsx`
   - `components/validator/FilteredPrompt.tsx`

3. **관리자 페이지** (옵션)
   - `app/admin/page.tsx`
   - `app/admin/logs/page.tsx`
   - `app/api/admin/stats/route.ts`

---

## ❓ 다음 단계 선택

**어떤 방식으로 진행하시겠습니까?**

### Option A: 나머지 컴포넌트 모두 생성
모든 필수 컴포넌트를 한 번에 생성하여 즉시 실행 가능하게 만들기

### Option B: 수동 설정 후 테스트
지금까지 생성된 파일들로 환경 설정하고 테스트 후 추가 개발

### Option C: 관리자 기능 먼저 구현
사용자 기능은 나중에, 관리자 대시보드부터 구현

---

## 💡 추천 순서

1. **지금 바로**: Python 파일 복사
2. **다음**: 나머지 필수 컴포넌트 생성 (Option A)
3. **그 다음**: 환경 변수 설정 + DB 연결
4. **마지막**: 개발 서버 실행 및 테스트

---

**계속 진행하시겠습니까?**
다음 작업을 선택해주세요:

1. 나머지 필수 컴포넌트 생성
2. 관리자 페이지 생성
3. Python 파일 복사 방법 상세 안내
4. Vercel 배포 설정
