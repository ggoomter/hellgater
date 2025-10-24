# 헬게이터 - REST API 설계

## 목차
1. [인증 (Authentication)](#1-인증-authentication)
2. [사용자 & 캐릭터](#2-사용자--캐릭터)
3. [운동 기록](#3-운동-기록)
4. [스킬트리](#4-스킬트리)
5. [맵 탐험](#5-맵-탐험)
6. [퀘스트 & 업적](#6-퀘스트--업적)
7. [커뮤니티](#7-커뮤니티)
8. [랭킹](#8-랭킹)

---

## 기본 정보

- **Base URL**: `https://api.hellgater.com/v1`
- **인증**: JWT Bearer Token
- **Content-Type**: `application/json`
- **에러 응답 형식**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {}
  }
}
```

---

## 1. 인증 (Authentication)

### POST /auth/register
**회원가입**

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "hellgater01",
  "gender": "male",
  "birthdate": "1990-01-01",
  "height": 175.5,
  "weight": 70.0
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "hellgater01"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

### POST /auth/login
**로그인**

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "hellgater01",
      "profileImageUrl": "https://cdn.hellgater.com/profiles/uuid.jpg",
      "subscriptionTier": "free"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 900
    }
  }
}
```

### POST /auth/refresh
**토큰 갱신**

Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "expiresIn": 900
  }
}
```

### POST /auth/logout
**로그아웃** (Access Token 필요)

Response (200):
```json
{
  "success": true,
  "message": "로그아웃 성공"
}
```

---

## 2. 사용자 & 캐릭터

### GET /users/me
**내 프로필 조회**

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "hellgater01",
    "profileImageUrl": "...",
    "bio": "운동 열심히 하는 중!",
    "gender": "male",
    "height": 175.5,
    "weight": 70.0,
    "createdAt": "2024-01-01T00:00:00Z",
    "subscriptionTier": "free"
  }
}
```

### PATCH /users/me
**프로필 수정**

Request:
```json
{
  "username": "newname",
  "bio": "새로운 소개",
  "weight": 72.0
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    // 업데이트된 사용자 정보
  }
}
```

### POST /users/me/profile-image
**프로필 이미지 업로드**

Request: `multipart/form-data`
- `image`: File

Response (200):
```json
{
  "success": true,
  "data": {
    "profileImageUrl": "https://cdn.hellgater.com/profiles/uuid.jpg"
  }
}
```

### GET /characters/me
**내 캐릭터 조회**

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "characterModel": "default",
    "totalLevel": 15,
    "totalExp": 45000,
    "nextLevelExp": 48500,
    "stats": {
      "muscleEndurance": 120,
      "strength": 150,
      "explosivePower": 80,
      "speed": 60,
      "mentalPower": 90,
      "flexibility": 70,
      "knowledge": 100,
      "balance": 75,
      "agility": 65
    },
    "attributes": {
      "earth": 2500,
      "fire": 1800,
      "wind": 1200,
      "water": 900,
      "mind": 600
    },
    "bodyParts": [
      {
        "id": 1,
        "code": "shoulder",
        "name": "어깨",
        "level": 12,
        "currentExp": 8500,
        "nextLevelExp": 10200,
        "max1RM": 45.0,
        "lastWorkoutAt": "2024-01-15T10:30:00Z"
      }
      // ... 나머지 6개 부위
    ]
  }
}
```

### POST /characters
**캐릭터 생성** (최초 1회만)

Request:
```json
{
  "characterModel": "default",
  "skinColor": "default"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    // 생성된 캐릭터 정보
  }
}
```

---

## 3. 운동 기록

### POST /workouts
**운동 기록 등록**

Request:
```json
{
  "exerciseId": 101,
  "bodyPart": "chest",
  "sets": 3,
  "reps": 10,
  "weight": 60.0,
  "workoutDate": "2024-01-15",
  "notes": "오늘 컨디션 좋았음!",
  "videoUrl": "https://cdn.hellgater.com/videos/uuid.mp4" // 선택
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "workout": {
      "id": "uuid",
      "exerciseId": 101,
      "exerciseName": "벤치프레스",
      "bodyPart": "chest",
      "sets": 3,
      "reps": 10,
      "weight": 60.0,
      "calculated1RM": 75.0,
      "rmPercentage": 75,
      "grade": "gold",
      "expGained": 2700,
      "caloriesBurned": 90,
      "verified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "results": {
      "levelUp": {
        "didLevelUp": true,
        "bodyPart": "chest",
        "oldLevel": 11,
        "newLevel": 12,
        "rewards": [
          { "type": "title", "value": "가슴 12레벨 달성" }
        ]
      },
      "expGained": {
        "bodyPart": 2160,
        "total": 540,
        "attribute": 810
      },
      "unlockedSkills": [
        {
          "id": 5,
          "code": "bench_press_20kg",
          "name": "벤치프레스 20kg 15회",
          "tier": "gold"
        }
      ],
      "newAchievements": [
        {
          "id": 10,
          "code": "chest_level_10",
          "name": "가슴왕",
          "rewards": { "exp": 1000 }
        }
      ],
      "mapProgress": {
        "stageCleared": false,
        "stageName": "보디빌딩 입문",
        "progress": {
          "workoutCount": 8,
          "target": 10
        }
      }
    }
  }
}
```

### GET /workouts
**운동 기록 목록 조회**

Query Parameters:
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `bodyPart`: string (선택)
- `exerciseId`: number (선택)
- `startDate`: string (YYYY-MM-DD)
- `endDate`: string (YYYY-MM-DD)

Response (200):
```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "id": "uuid",
        "exerciseName": "벤치프레스",
        "bodyPart": "chest",
        "sets": 3,
        "reps": 10,
        "weight": 60.0,
        "expGained": 2700,
        "grade": "gold",
        "createdAt": "2024-01-15T10:30:00Z"
      }
      // ...
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "summary": {
      "totalWorkouts": 150,
      "totalExp": 450000,
      "totalCalories": 35000,
      "currentStreak": 7
    }
  }
}
```

### GET /workouts/:id
**운동 기록 상세 조회**

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "exercise": {
      "id": 101,
      "name": "벤치프레스",
      "bodyPart": "chest",
      "category": "compound",
      "difficulty": "intermediate"
    },
    "sets": 3,
    "reps": 10,
    "weight": 60.0,
    "calculated1RM": 75.0,
    "rmPercentage": 75,
    "grade": "gold",
    "expGained": 2700,
    "caloriesBurned": 90,
    "notes": "오늘 컨디션 좋았음!",
    "videoUrl": "...",
    "verified": false,
    "workoutDate": "2024-01-15",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /workouts/:id
**운동 기록 삭제**

Response (200):
```json
{
  "success": true,
  "message": "운동 기록이 삭제되었습니다"
}
```

### GET /exercises
**운동 종목 목록 조회**

Query Parameters:
- `bodyPart`: string (선택)
- `difficulty`: string (선택)
- `search`: string (선택)

Response (200):
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": 101,
        "code": "bench_press",
        "name": "벤치프레스",
        "bodyPart": "chest",
        "category": "compound",
        "difficulty": "intermediate",
        "description": "...",
        "videoUrl": "...",
        "thumbnailUrl": "..."
      }
      // ...
    ]
  }
}
```

### GET /exercises/:id
**운동 종목 상세 정보**

Response (200):
```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "벤치프레스",
    "bodyPart": "chest",
    "category": "compound",
    "difficulty": "intermediate",
    "description": "가슴 운동의 대표적인 복합 운동",
    "howTo": "1. 벤치에 눕는다\n2. 바벨을 잡는다...",
    "videoUrl": "...",
    "thumbnailUrl": "...",
    "myBestRecord": {
      "max1RM": 75.0,
      "maxWeight": 65.0,
      "maxReps": 12,
      "lastWorkout": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 4. 스킬트리

### GET /skills
**스킬 목록 조회**

Query Parameters:
- `bodyPart`: string (필수)

Response (200):
```json
{
  "success": true,
  "data": {
    "bodyPart": "chest",
    "skills": [
      {
        "id": 1,
        "code": "pushup_15",
        "name": "푸쉬업 15회",
        "tier": "beginner",
        "exerciseId": 201,
        "requirements": {
          "reps": 15
        },
        "position": { "x": 0, "y": 0 },
        "iconUrl": "...",
        "description": "기본 푸쉬업 15회 달성",
        "isUnlocked": true,
        "isAvailable": false,
        "connections": []
      },
      {
        "id": 2,
        "code": "bench_pushup",
        "name": "벤치 푸쉬업",
        "tier": "beginner",
        "requirements": {
          "prerequisiteSkills": [1]
        },
        "position": { "x": 1, "y": 0 },
        "iconUrl": "...",
        "isUnlocked": false,
        "isAvailable": true, // 해금 가능
        "connections": [1]
      },
      {
        "id": 3,
        "code": "dips_5",
        "name": "딥스 5회",
        "tier": "silver",
        "requirements": {
          "level": 3,
          "prerequisiteSkills": [1]
        },
        "position": { "x": 0, "y": 1 },
        "isUnlocked": false,
        "isAvailable": false, // 레벨 부족
        "connections": [1]
      }
      // ...
    ],
    "userProgress": {
      "currentLevel": 12,
      "unlockedCount": 15,
      "totalCount": 45
    }
  }
}
```

### GET /skills/me
**내가 해금한 스킬 목록**

Response (200):
```json
{
  "success": true,
  "data": {
    "unlockedSkills": [
      {
        "skillId": 1,
        "skillName": "푸쉬업 15회",
        "bodyPart": "chest",
        "tier": "beginner",
        "unlockedAt": "2024-01-10T08:00:00Z",
        "timesUsed": 25
      }
      // ...
    ],
    "totalUnlocked": 15
  }
}
```

---

## 5. 맵 탐험

### GET /maps
**맵 목록 조회**

Query Parameters:
- `mapType`: string (선택) - 'none', 'earth', 'fire', 'wind', 'water', 'mind'

Response (200):
```json
{
  "success": true,
  "data": {
    "maps": [
      {
        "type": "none",
        "name": "무속성 과정",
        "description": "기초적인 종합 운동",
        "stages": [
          {
            "id": 1,
            "code": "stage_0_1",
            "name": "운동의 필요성",
            "chapter": 1,
            "stage": 1,
            "status": "completed",
            "requirements": {},
            "clearConditions": [
              { "type": "workout_count", "target": 3 }
            ],
            "progress": {
              "workoutCount": 5
            },
            "rewards": { "exp": 500 },
            "position": { "x": 0, "y": 0 },
            "completedAt": "2024-01-05T12:00:00Z"
          },
          {
            "id": 2,
            "code": "stage_0_2",
            "name": "기초 체력 다지기",
            "status": "in_progress",
            "requirements": { "prerequisiteStage": 1 },
            "clearConditions": [
              { "type": "workout_count", "target": 5 },
              { "type": "exp_gain", "target": 2000 }
            ],
            "progress": {
              "workoutCount": 3,
              "expGained": 1200
            },
            "rewards": { "exp": 1000 },
            "position": { "x": 1, "y": 0 }
          }
          // ...
        ]
      },
      {
        "type": "earth",
        "name": "땅의 과정 (근육)",
        "description": "보디빌딩 전문 커리큘럼",
        "isLocked": false,
        "stages": [...]
      }
      // ...
    ]
  }
}
```

### GET /maps/progress
**내 맵 진행 상황**

Response (200):
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalStages": 125,
      "completedStages": 18,
      "inProgressStages": 3,
      "completionPercentage": 14.4
    },
    "byMapType": [
      {
        "type": "none",
        "name": "무속성 과정",
        "totalStages": 25,
        "completed": 10,
        "inProgress": 2
      },
      {
        "type": "earth",
        "name": "땅의 과정",
        "totalStages": 20,
        "completed": 5,
        "inProgress": 1
      }
      // ...
    ]
  }
}
```

---

## 6. 퀘스트 & 업적

### GET /quests/daily
**오늘의 일일 퀘스트**

Response (200):
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "id": "uuid",
        "questId": 1,
        "code": "daily_workout_3",
        "name": "오늘의 운동",
        "description": "오늘 3회 운동하기",
        "questType": "workout_count",
        "targetValue": 3,
        "progress": 2,
        "isCompleted": false,
        "rewards": { "exp": 300 },
        "assignedDate": "2024-01-15",
        "expiresAt": "2024-01-16T00:00:00Z"
      },
      {
        "id": "uuid",
        "questId": 2,
        "code": "daily_chest_workout",
        "name": "가슴의 날",
        "description": "가슴 운동 2회 완료하기",
        "progress": 2,
        "isCompleted": true,
        "rewardClaimed": false,
        "rewards": { "exp": 500 }
      }
      // ...
    ],
    "summary": {
      "total": 3,
      "completed": 1,
      "inProgress": 2
    }
  }
}
```

### POST /quests/:id/claim
**퀘스트 보상 수령**

Response (200):
```json
{
  "success": true,
  "data": {
    "rewards": {
      "exp": 500
    },
    "message": "보상을 받았습니다!"
  }
}
```

### GET /achievements
**업적 목록**

Query Parameters:
- `category`: string (선택)
- `isCompleted`: boolean (선택)

Response (200):
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": 1,
        "code": "first_workout",
        "name": "첫 걸음",
        "description": "첫 운동 기록 달성",
        "category": "workout",
        "tier": "bronze",
        "iconUrl": "...",
        "badgeUrl": "...",
        "isCompleted": true,
        "completedAt": "2024-01-01T10:00:00Z",
        "progress": 1,
        "targetValue": 1,
        "rewards": { "exp": 100, "title": "헬게이터 입문자" }
      },
      {
        "id": 2,
        "code": "workout_veteran",
        "name": "헬린이 탈출",
        "description": "총 100회 운동 달성",
        "tier": "silver",
        "isCompleted": false,
        "progress": 45,
        "targetValue": 100,
        "rewards": { "exp": 5000, "title": "헬스 베테랑" }
      }
      // ...
    ],
    "summary": {
      "total": 50,
      "completed": 12,
      "completionPercentage": 24
    }
  }
}
```

---

## 7. 커뮤니티

### GET /posts
**게시글 목록 조회**

Query Parameters:
- `page`: number
- `limit`: number
- `category`: string (선택)
- `sort`: string ('latest', 'popular', 'trending')

Response (200):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "author": {
          "id": "uuid",
          "username": "hellgater01",
          "profileImageUrl": "...",
          "totalLevel": 25
        },
        "title": "벤치프레스 100kg 달성!",
        "content": "드디어 3대 100 달성했습니다!",
        "images": ["...", "..."],
        "category": "achievement",
        "workoutRecord": {
          "exerciseName": "벤치프레스",
          "weight": 100,
          "reps": 1
        },
        "likesCount": 125,
        "commentsCount": 23,
        "viewsCount": 450,
        "isLiked": false,
        "createdAt": "2024-01-15T10:00:00Z"
      }
      // ...
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "totalPages": 25
    }
  }
}
```

### POST /posts
**게시글 작성**

Request:
```json
{
  "title": "제목 (선택)",
  "content": "내용",
  "images": ["https://...", "https://..."],
  "category": "achievement",
  "workoutRecordId": "uuid" // 선택
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    // 생성된 게시글 정보
  }
}
```

### GET /posts/:id
**게시글 상세 조회**

Response (200):
```json
{
  "success": true,
  "data": {
    // 게시글 상세 정보 + 댓글
    "post": {...},
    "comments": [
      {
        "id": "uuid",
        "author": {...},
        "content": "축하합니다!",
        "likesCount": 5,
        "createdAt": "2024-01-15T11:00:00Z",
        "replies": []
      }
    ]
  }
}
```

### POST /posts/:id/like
**게시글 좋아요**

Response (200):
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likesCount": 126
  }
}
```

### DELETE /posts/:id/like
**좋아요 취소**

### POST /posts/:id/comments
**댓글 작성**

Request:
```json
{
  "content": "댓글 내용",
  "parentCommentId": "uuid" // 대댓글인 경우
}
```

---

## 8. 랭킹

### GET /leaderboards
**랭킹 조회**

Query Parameters:
- `type`: string (필수) - 'total_level', 'body_part', 'workout_count'
- `bodyPart`: string (type이 'body_part'일 때 필수)
- `period`: string - 'daily', 'weekly', 'monthly', 'all_time'
- `limit`: number (default: 100)

Response (200):
```json
{
  "success": true,
  "data": {
    "leaderboard": {
      "type": "total_level",
      "period": "all_time",
      "rankings": [
        {
          "rank": 1,
          "user": {
            "id": "uuid",
            "username": "muscle_king",
            "profileImageUrl": "...",
            "totalLevel": 85
          },
          "score": 85,
          "change": 0 // 순위 변동 (0: 변동없음, +2: 2칸 상승)
        },
        {
          "rank": 2,
          "user": {...},
          "score": 78,
          "change": -1
        }
        // ...
      ],
      "myRank": {
        "rank": 156,
        "score": 25,
        "change": +5
      }
    },
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### GET /leaderboards/friends
**친구 랭킹**

Response (200):
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "user": {...},
        "score": 42,
        "isFriend": true
      }
      // ...
    ]
  }
}
```

---

## 9. 통계

### GET /stats/me
**내 통계 조회**

Query Parameters:
- `period`: string - 'week', 'month', 'year', 'all'

Response (200):
```json
{
  "success": true,
  "data": {
    "period": "month",
    "overview": {
      "totalWorkouts": 45,
      "totalExp": 125000,
      "totalCalories": 8500,
      "totalWeight": 27000, // kg (무게 × 횟수 × 세트 합산)
      "currentStreak": 7,
      "longestStreak": 14
    },
    "byBodyPart": [
      {
        "bodyPart": "chest",
        "workoutCount": 12,
        "expGained": 35000,
        "avgWeight": 62.5
      }
      // ...
    ],
    "byExercise": [
      {
        "exerciseName": "벤치프레스",
        "count": 8,
        "max1RM": 75.0,
        "avgReps": 10
      }
      // ...
    ],
    "timeline": [
      {
        "date": "2024-01-15",
        "workouts": 2,
        "exp": 5400,
        "calories": 180
      }
      // ...
    ]
  }
}
```

---

## 10. 업로드

### POST /upload/video
**영상 업로드 (운동 인증)**

Request: `multipart/form-data`
- `video`: File (mp4, mov, avi)
- `workoutRecordId`: string (선택)

Response (200):
```json
{
  "success": true,
  "data": {
    "videoUrl": "https://cdn.hellgater.com/videos/uuid.mp4",
    "thumbnailUrl": "https://cdn.hellgater.com/thumbnails/uuid.jpg",
    "duration": 15.5,
    "size": 5242880
  }
}
```

### POST /upload/image
**이미지 업로드**

Request: `multipart/form-data`
- `image`: File (jpg, png, webp)

Response (200):
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.hellgater.com/images/uuid.jpg",
    "thumbnailUrl": "https://cdn.hellgater.com/thumbnails/uuid.jpg"
  }
}
```

---

## 11. 에러 코드

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | 이메일 또는 비밀번호 오류 |
| `AUTH_TOKEN_EXPIRED` | 401 | 토큰 만료 |
| `AUTH_TOKEN_INVALID` | 401 | 유효하지 않은 토큰 |
| `USER_NOT_FOUND` | 404 | 사용자를 찾을 수 없음 |
| `USER_ALREADY_EXISTS` | 409 | 이미 존재하는 사용자 |
| `VALIDATION_ERROR` | 400 | 입력 검증 실패 |
| `WORKOUT_NOT_FOUND` | 404 | 운동 기록을 찾을 수 없음 |
| `EXERCISE_NOT_FOUND` | 404 | 운동 종목을 찾을 수 없음 |
| `SKILL_ALREADY_UNLOCKED` | 409 | 이미 해금된 스킬 |
| `SKILL_REQUIREMENTS_NOT_MET` | 400 | 스킬 해금 조건 미달 |
| `QUEST_ALREADY_CLAIMED` | 409 | 이미 수령한 보상 |
| `QUEST_NOT_COMPLETED` | 400 | 완료하지 않은 퀘스트 |
| `FILE_TOO_LARGE` | 413 | 파일 크기 초과 |
| `FILE_INVALID_TYPE` | 400 | 지원하지 않는 파일 형식 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 한도 초과 |
| `SERVER_ERROR` | 500 | 서버 내부 오류 |

---

## 12. Rate Limiting

- **인증 API**: 5 req/min
- **운동 기록**: 30 req/min
- **조회 API**: 100 req/min
- **업로드**: 10 req/min

---

**다음 단계**: 프론트엔드 컴포넌트 구조 설계 및 개발 로드맵 수립
