# 신체 부위 세분화 설계 (20개 부위)

## 부위 목록

### 상체 (Upper Body)

#### 어깨 (Shoulder) - 3개
1. **전면 어깨** (Front Deltoid) - `front_delt`
   - 앞면
   - 색상: #FF5B5B (빨강)
   - 운동: 프론트 레이즈, 오버헤드 프레스 등

2. **측면 어깨** (Side Deltoid) - `side_delt`
   - 앞면/뒷면 공통
   - 색상: #FF7B7B (연한 빨강)
   - 운동: 사이드 레터럴 레이즈 등

3. **후면 어깨** (Rear Deltoid) - `rear_delt`
   - 뒷면
   - 색상: #FF9B9B (더 연한 빨강)
   - 운동: 리어 델트 플라이 등

#### 가슴 (Chest) - 2개
4. **상부 가슴** (Upper Chest) - `upper_chest`
   - 앞면
   - 색상: #78E6C8 (민트)
   - 운동: 인클라인 벤치프레스 등

5. **중하부 가슴** (Lower Chest) - `lower_chest`
   - 앞면
   - 색상: #58C6A8 (진한 민트)
   - 운동: 플랫/디클라인 벤치프레스 등

#### 등 (Back) - 3개
6. **승모근** (Trapezius) - `trapezius`
   - 뒷면 (상부)
   - 색상: #78E6C8 (민트)
   - 운동: 슈러그, 업라이트 로우 등

7. **광배근** (Latissimus Dorsi) - `lats`
   - 뒷면 (중부)
   - 색상: #58C6A8 (진한 민트)
   - 운동: 풀업, 랫풀다운, 로우 등

8. **하부 등** (Lower Back) - `lower_back`
   - 뒷면 (하부)
   - 색상: #38A688 (더 진한 민트)
   - 운동: 데드리프트, 백 익스텐션 등

#### 팔 (Arms) - 3개
9. **이두** (Biceps) - `biceps`
   - 앞면
   - 색상: #FF5B5B (빨강)
   - 운동: 바벨 컬, 덤벨 컬 등

10. **삼두** (Triceps) - `triceps`
    - 뒷면
    - 색상: #FF7B7B (연한 빨강)
    - 운동: 푸쉬다운, 라잉 익스텐션 등

11. **전완** (Forearm) - `forearm`
    - 앞면/뒷면 공통
    - 색상: #FFA0A0 (더 연한 빨강)
    - 운동: 리스트 컬, 그립 운동 등

#### 복부 (Core) - 2개
12. **복근** (Abdominal) - `abdominal`
    - 앞면
    - 색상: #78E6C8 (민트)
    - 운동: 크런치, 레그레이즈 등

13. **복사근** (Obliques) - `obliques`
    - 앞면 측면
    - 색상: #58C6A8 (진한 민트)
    - 운동: 러시안 트위스트, 사이드 벤드 등

### 하체 (Lower Body)

#### 엉덩이 (Glutes) - 1개
14. **엉덩이** (Glutes) - `glutes`
    - 뒷면
    - 색상: #E6E6E6 (회색)
    - 운동: 힙 쓰러스트, 런지 등

#### 허벅지 (Thigh) - 3개
15. **대퇴사두** (Quadriceps) - `quadriceps`
    - 앞면
    - 색상: #E6E6E6 (회색)
    - 운동: 스쿼트, 레그 익스텐션 등

16. **햄스트링** (Hamstring) - `hamstring`
    - 뒷면
    - 색상: #C6C6C6 (진한 회색)
    - 운동: 레그 컬, 루마니안 데드리프트 등

17. **내전근** (Adductors) - `adductors`
    - 앞면 안쪽
    - 색상: #F0F0F0 (연한 회색)
    - 운동: 애덕터 머신 등

#### 종아리 (Calves) - 1개
18. **종아리** (Calves) - `calves`
    - 앞면/뒷면 공통
    - 색상: #D0D0D0 (중간 회색)
    - 운동: 카프 레이즈 등

### 기타

19. **목** (Neck) - `neck`
    - 앞면/뒷면 공통
    - 색상: #FFB0B0 (연한 핑크)
    - 운동: 넥 컬 등

20. **전신** (Full Body) - `full_body`
    - 복합 운동용
    - 색상: #FFFFFF (흰색)
    - 운동: 버피, 클린앤저크 등

---

## 데이터베이스 ID 할당

| ID | Code | 이름 (KO) | 이름 (EN) | View | 색상 |
|----|------|-----------|-----------|------|------|
| 1  | front_delt | 전면 어깨 | Front Deltoid | front | #FF5B5B |
| 2  | side_delt | 측면 어깨 | Side Deltoid | both | #FF7B7B |
| 3  | rear_delt | 후면 어깨 | Rear Deltoid | back | #FF9B9B |
| 4  | upper_chest | 상부 가슴 | Upper Chest | front | #78E6C8 |
| 5  | lower_chest | 중하부 가슴 | Lower Chest | front | #58C6A8 |
| 6  | trapezius | 승모근 | Trapezius | back | #78E6C8 |
| 7  | lats | 광배근 | Lats | back | #58C6A8 |
| 8  | lower_back | 하부 등 | Lower Back | back | #38A688 |
| 9  | biceps | 이두 | Biceps | front | #FF5B5B |
| 10 | triceps | 삼두 | Triceps | back | #FF7B7B |
| 11 | forearm | 전완 | Forearm | both | #FFA0A0 |
| 12 | abdominal | 복근 | Abdominal | front | #78E6C8 |
| 13 | obliques | 복사근 | Obliques | front | #58C6A8 |
| 14 | glutes | 엉덩이 | Glutes | back | #E6E6E6 |
| 15 | quadriceps | 대퇴사두 | Quadriceps | front | #E6E6E6 |
| 16 | hamstring | 햄스트링 | Hamstring | back | #C6C6C6 |
| 17 | adductors | 내전근 | Adductors | front | #F0F0F0 |
| 18 | calves | 종아리 | Calves | both | #D0D0D0 |
| 19 | neck | 목 | Neck | both | #FFB0B0 |
| 20 | full_body | 전신 | Full Body | both | #FFFFFF |

---

## 이미지 클릭 영역 매핑

### 앞면 (Front)
- 전면 어깨 (1): top: 8%, left: 10%, width: 27%, height: 7%
- 측면 어깨 (2): 양쪽 가장자리
- 상부 가슴 (4): top: 16%, left: 12%, width: 23%, height: 6%
- 중하부 가슴 (5): top: 23%, left: 12%, width: 23%, height: 8%
- 이두 (9): top: 22%, left: 0%, width: 10%, height: 15%
- 전완 (11): top: 38%, left: 0%, width: 10%, height: 12%
- 복근 (12): top: 32%, left: 14%, width: 20%, height: 12%
- 복사근 (13): top: 32%, left: 8%, width: 6%, height: 12%
- 대퇴사두 (15): top: 52%, left: 10%, width: 28%, height: 25%
- 내전근 (17): top: 52%, left: 16%, width: 5%, height: 20%
- 종아리 (18): top: 78%, left: 12%, width: 24%, height: 18%

### 뒷면 (Back)
- 후면 어깨 (3): top: 8%, left: 10%, width: 27%, height: 7%
- 측면 어깨 (2): 양쪽 가장자리
- 승모근 (6): top: 10%, left: 12%, width: 23%, height: 8%
- 광배근 (7): top: 20%, left: 10%, width: 27%, height: 15%
- 하부 등 (8): top: 36%, left: 12%, width: 23%, height: 8%
- 삼두 (10): top: 22%, left: 0%, width: 10%, height: 15%
- 전완 (11): top: 38%, left: 0%, width: 10%, height: 12%
- 엉덩이 (14): top: 45%, left: 14%, width: 20%, height: 8%
- 햄스트링 (16): top: 54%, left: 10%, width: 28%, height: 23%
- 종아리 (18): top: 78%, left: 12%, width: 24%, height: 18%

---

## 마이그레이션 계획

1. **Prisma 마이그레이션 생성**
   - 기존 7개 부위 → 20개 부위로 확장
   - seed 데이터 추가

2. **기존 데이터 처리**
   - 기존 UserBodyPart 데이터 마이그레이션
   - 팔(4) → 이두(9), 삼두(10)로 분할
   - 다리(7) → 대퇴사두(15), 햄스트링(16)으로 분할

3. **프론트엔드 업데이트**
   - BodyPartSelector 20개 부위 반영
   - ExerciseSelector 업데이트
