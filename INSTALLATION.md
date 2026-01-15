# 🚀 설치 및 실행 가이드

## ✅ Step 1 완료: Python 파일 복사 ✓
- ✓ `prompt_security_validator.py` 복사 완료
- ✓ `image_analyzer.py` 복사 완료

## ✅ Step 2 완료: 환경 변수 파일 생성 ✓
- ✓ `.env.local` 파일 생성 완료

## ✅ Step 3 완료: 필수 컴포넌트 생성 ✓
- ✓ 모든 UI 컴포넌트 생성 완료
- ✓ 검증 컴포넌트 생성 완료
- ✓ 레이아웃 컴포넌트 생성 완료

---

## 📝 다음 단계

### Step 4: 패키지 설치

Windows PowerShell 또는 CMD에서 실행:

```bash
cd e:\1.개발\security-prompt-web
npm install
```

**예상 시간**: 2-3분

---

### Step 5: 환경 변수 설정

`.env.local` 파일을 열고 다음을 수정:

#### Option A: Supabase 사용 (추천)

1. https://supabase.com 접속
2. "New Project" 클릭
3. Database URL 복사
4. `.env.local`에 붙여넣기:

```env
DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ID]:[PASSWORD]@[HOST]:5432/postgres"
```

#### Option B: 로컬 PostgreSQL 사용

PostgreSQL이 설치되어 있다면:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kepco_security?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/kepco_security?schema=public"
```

#### NextAuth 비밀키 생성

Git Bash 또는 WSL에서:
```bash
openssl rand -base64 32
```

생성된 키를 `.env.local`에 추가:
```env
NEXTAUTH_SECRET="생성된-32자-키"
```

---

### Step 6: 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# DB 스키마 적용
npx prisma db push
```

**주의**: `prisma db push` 전에 DATABASE_URL이 올바르게 설정되어 있어야 합니다.

---

### Step 7: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 🎯 빠른 테스트 (DB 없이)

DB 설정 없이 바로 테스트하고 싶다면:

1. `.env.local`에서 DATABASE_URL 주석 처리:
```env
# DATABASE_URL="..."
# DIRECT_URL="..."
```

2. `lib/db.ts` 파일의 saveValidationLog 함수를 임시로 수정:
```typescript
export async function saveValidationLog(data: any) {
  // 임시로 로그만 출력
  console.log('Validation log:', data)
  return { id: 1 }
}
```

3. 개발 서버 실행:
```bash
npm run dev
```

**주의**: 이 방법은 로그가 저장되지 않으므로 테스트 용도로만 사용하세요.

---

## 🐛 문제 해결

### 1. npm install 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. Python 실행 오류

Python이 설치되어 있는지 확인:
```bash
python --version
# 또는
py --version
```

`lib/validator.ts`의 Python 명령어 수정:
```typescript
// 'python' 대신 'py' 사용
const python = spawn('py', [pythonScript], {
```

### 3. Prisma 오류

```bash
# Prisma 캐시 정리
npx prisma generate --force

# 또는 완전히 재설치
rm -rf node_modules/.prisma
npm install
```

### 4. TypeScript 오류

```bash
# TypeScript 재빌드
npm run build
```

---

## 📊 설치 확인 체크리스트

- [ ] Python 파일 복사 완료
- [ ] npm install 성공
- [ ] .env.local 설정 완료
- [ ] DATABASE_URL 설정 (또는 임시 비활성화)
- [ ] npx prisma generate 성공
- [ ] npm run dev 실행 성공
- [ ] http://localhost:3000 접속 성공
- [ ] 프롬프트 입력 테스트 성공

---

## 🎉 다음 단계

### 웹 애플리케이션이 실행되면:

1. **테스트**:
   - 안전한 프롬프트 입력
   - 위험한 프롬프트 입력 (테스트용)
   - 필터링 결과 확인
   - 복사 기능 테스트

2. **관리자 페이지 개발** (선택):
   - `/admin` 경로
   - 로그 조회
   - 통계 대시보드

3. **Vercel 배포** (선택):
   - Vercel CLI 설치
   - 프로젝트 연결
   - 환경 변수 설정
   - 배포

---

## 💡 추가 도움말

### Supabase 빠른 설정

1. https://supabase.com 접속 → 가입/로그인
2. "New Project" 클릭
3. Project 정보 입력:
   - Name: `kepco-security`
   - Database Password: 강력한 비밀번호
   - Region: Northeast Asia (Seoul)
4. 프로젝트 생성 대기 (1-2분)
5. Settings → Database → Connection String 복사
6. `.env.local`에 붙여넣기

### 로컬 PostgreSQL 설치 (Windows)

1. https://www.postgresql.org/download/windows/
2. 설치 프로그램 다운로드 및 실행
3. 기본 포트 5432 사용
4. 비밀번호 설정 기억하기
5. pgAdmin 4 자동 설치됨

---

**준비 완료! 이제 Step 4부터 진행하세요!** 🚀

질문이나 오류가 있으면 말씀해주세요.
