# 개발 가이드라인 - 헬게이터 프로젝트

## 🚨 중요: 전체 스택 일관성 체크

### 기본 원칙
**절대 부분적으로 구현하지 않는다!**

새로운 기능이나 수정 사항이 있을 때는 **반드시 아래 순서대로 전체를 체크하고 구현**해야 합니다.

---

## ✅ 구현 전 필수 체크리스트

### 1단계: 설계 문서 확인
- [ ] `docs/` 폴더의 관련 설계 문서 확인
  - `ARCHITECTURE.md` - 시스템 구조
  - `DATABASE_SCHEMA.md` - DB 스키마
  - `API_DESIGN.md` - API 명세
  - `GAME_LOGIC.md` - 게임 로직
  - `FRONTEND_DESIGN.md` - UI/UX 구조

### 2단계: 데이터베이스 (Prisma Schema)
- [ ] `server/prisma/schema.prisma` 확인
- [ ] 필요한 모델/필드가 정의되어 있는가?
- [ ] 필드 타입이 데이터 크기에 적합한가?
  - ✅ 짧은 문자열: `@db.VarChar(50)`, `@db.VarChar(255)`
  - ✅ 긴 문자열/토큰: `@db.Text`
  - ✅ UUID: `@db.Uuid`
  - ✅ 날짜: `DateTime`
- [ ] 관계(Relation)가 올바르게 설정되어 있는가?
- [ ] 인덱스가 필요한 필드에 `@@index` 추가되어 있는가?

### 3단계: 백엔드 API
- [ ] **타입 정의** (`shared/types/`)
  - Request/Response 타입이 정의되어 있는가?
  - Prisma 모델과 일치하는가?
- [ ] **Validation** (`server/src/middleware/validation.middleware.ts`)
  - Zod 스키마가 정의되어 있는가?
  - 필드 길이, 형식 검증이 올바른가?
- [ ] **Controller** (`server/src/controllers/`)
  - 비즈니스 로직이 구현되어 있는가?
  - 에러 처리가 되어 있는가?
  - 트랜잭션이 필요한 경우 적용되어 있는가?
- [ ] **Routes** (`server/src/routes/`)
  - 엔드포인트가 설계 문서와 일치하는가?
  - Validation 미들웨어가 적용되어 있는가?
  - 인증이 필요한 경우 `authenticate` 미들웨어가 있는가?

### 4단계: 프론트엔드
- [ ] **API Service** (`client/src/services/api/`)
  - API 호출 함수가 구현되어 있는가?
  - 엔드포인트 경로가 백엔드와 일치하는가?
  - Request/Response 타입이 정의되어 있는ga?
- [ ] **React Query Hooks** (`client/src/hooks/`)
  - `useMutation`, `useQuery` 훅이 구현되어 있는가?
  - 에러 처리와 성공 콜백이 있는가?
- [ ] **UI Components** (`client/src/pages/`, `client/src/components/`)
  - 폼 Validation이 백엔드와 일치하는가?
  - 에러 메시지가 사용자 친화적인가?
  - 로딩 상태가 표시되는가?

### 5단계: 환경 설정
- [ ] **환경 변수** (`.env`, `docker-compose.yml`)
  - API URL이 올바르게 설정되어 있는가?
  - 데이터베이스 연결 정보가 정확한가?
  - JWT 시크릿 등 보안 설정이 되어 있는가?
- [ ] **Docker 설정**
  - 볼륨 마운트가 올바른가?
  - 환경 변수가 주입되어 있는가?
  - 포트 매핑이 정확한가?

---

## 🔄 기능 수정 시 체크 흐름

### 예시: 비밀번호 검증 규칙 변경

1. **설계 문서 업데이트**
   - `docs/API_DESIGN.md`에 새로운 비밀번호 규칙 명시

2. **백엔드 Validation 수정**
   - `server/src/middleware/validation.middleware.ts` → Zod 스키마 수정

3. **프론트엔드 Validation 수정**
   - `client/src/pages/Register.tsx` → `validatePassword` 함수 수정

4. **테스트**
   - 양쪽 검증이 일치하는지 확인

### 예시: 새로운 데이터 필드 추가

1. **설계 문서 확인**
   - `docs/DATABASE_SCHEMA.md` 확인

2. **Prisma Schema 수정**
   - `server/prisma/schema.prisma`에 필드 추가
   - 필드 타입과 크기 **반드시 확인**
   - **마이그레이션 실행**: `npx prisma migrate dev`

3. **공유 타입 업데이트**
   - `shared/types/user.types.ts` 등 타입 정의 수정

4. **백엔드 Controller 수정**
   - 새 필드를 처리하는 로직 추가
   - Validation 스키마 업데이트

5. **프론트엔드 수정**
   - API Service 타입 업데이트
   - UI에 새 필드 입력란 추가

6. **테스트**
   - 전체 플로우 테스트 (프론트 → 백엔드 → DB)

---

## ⚠️ 자주 발생하는 실수와 해결

### 1. DB 필드 타입 불일치
**문제**: `VarChar(255)`에 JWT 토큰 저장 → "Column too long" 에러

**해결**:
```prisma
// ❌ 잘못된 예
tokenHash String @db.VarChar(255)

// ✅ 올바른 예
tokenHash String @db.Text
```

**체크**: JWT, 긴 문자열은 항상 `@db.Text` 사용

### 2. API 엔드포인트 불일치
**문제**:
- 프론트: `/auth/register`
- 백엔드: `/api/v1/auth/register`
→ 404 에러

**해결**:
```typescript
// client/src/services/api/axios.ts
const BASE_URL = 'http://localhost:4000/api/v1'; // ✅ /api/v1 포함

// docker-compose.yml
environment:
  VITE_API_URL: http://localhost:4000/api/v1 # ✅ /api/v1 포함
```

### 3. Validation 불일치
**문제**:
- 프론트: 최소 6자
- 백엔드: 최소 8자
→ 사용자 혼란

**해결**: 양쪽 검증 규칙을 **동일하게** 유지

### 4. 환경 변수 미반영
**문제**: `docker-compose.yml` 수정 후에도 이전 값 사용

**해결**:
```bash
# 환경 변수 변경 시 컨테이너 재생성 필요
docker-compose up -d client
docker-compose up -d server
```

### 5. Prisma 클라이언트 미반영
**문제**: Schema 수정 후에도 이전 타입 사용

**해결**:
```bash
# 마이그레이션 후 반드시 서버 재시작
docker-compose exec server sh -c "cd server && npx prisma migrate dev"
docker-compose restart server
```

---

## 📋 구현 템플릿

### 새 기능 추가 시 체크리스트

```markdown
## [기능명] 구현 체크리스트

### 1. 설계
- [ ] `docs/` 문서에 기능 명세 작성
- [ ] DB 스키마 설계
- [ ] API 엔드포인트 설계

### 2. 데이터베이스
- [ ] Prisma Schema 작성
- [ ] 필드 타입 검증 (문자열 길이 특히 주의!)
- [ ] 관계 설정
- [ ] 인덱스 설정
- [ ] 마이그레이션 실행

### 3. 백엔드
- [ ] 공유 타입 정의 (`shared/types/`)
- [ ] Validation 스키마 (Zod)
- [ ] Controller 로직
- [ ] Routes 설정
- [ ] 에러 처리

### 4. 프론트엔드
- [ ] API Service 함수
- [ ] React Query Hooks
- [ ] UI 컴포넌트
- [ ] 폼 Validation (백엔드와 일치!)
- [ ] 에러 UI

### 5. 환경 설정
- [ ] 환경 변수 확인
- [ ] Docker 설정 확인
- [ ] 포트/URL 일치 확인

### 6. 테스트
- [ ] 전체 플로우 테스트
- [ ] 에러 케이스 테스트
- [ ] 브라우저 캐시 클리어 후 재테스트
```

---

## 🎯 Best Practices

### DO ✅
1. **설계 먼저, 구현은 나중에**
2. **전체 스택을 한 번에 체크**
3. **타입을 명시적으로 정의**
4. **Validation을 양쪽에 동일하게**
5. **마이그레이션 후 반드시 재시작**
6. **환경 변수 변경 시 컨테이너 재생성**

### DON'T ❌
1. **부분적으로 구현하지 않기**
2. **타입 크기를 추측하지 않기** (JWT는 항상 TEXT!)
3. **캐시 문제를 무시하지 않기**
4. **Validation 불일치 방치하지 않기**
5. **에러 메시지만 보고 추측하지 않기** (전체 체크!)

---

## 🔧 트러블슈팅 가이드

### 에러 발생 시 체크 순서

1. **에러 메시지 정확히 읽기**
   - 어느 파일, 어느 줄에서 발생했는가?
   - 정확히 어떤 에러인가?

2. **해당 레이어 체크**
   - DB 에러 → Prisma Schema, 마이그레이션
   - API 에러 → Controller, Routes
   - UI 에러 → Component, API Service

3. **연관된 모든 레이어 체크**
   - DB → 백엔드 → 프론트엔드 순서로
   - 타입, Validation, 환경 변수 일치 확인

4. **캐시 문제 의심**
   - 브라우저 강제 새로고침 (Ctrl + Shift + R)
   - Docker 컨테이너 재시작
   - 시크릿 모드로 테스트

5. **로그 확인**
   ```bash
   # 백엔드 로그
   docker-compose logs -f server

   # 프론트엔드 로그
   docker-compose logs -f client

   # DB 로그
   docker-compose logs -f postgres
   ```

---

## 📚 참고 자료

- **설계 문서**: `docs/` 폴더
- **Prisma 문서**: https://www.prisma.io/docs
- **Docker 가이드**: `DOCKER_GUIDE.md`
- **시작 가이드**: `GETTING_STARTED.md`

---

**마지막 업데이트**: 2025-10-24
**작성자**: Claude Code

이 가이드라인을 따라 개발하면 부분적 구현으로 인한 에러를 방지하고,
일관성 있는 전체 스택 개발이 가능합니다.
