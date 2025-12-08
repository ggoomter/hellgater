#!/bin/sh
set -e

echo "🚀 Starting server initialization..."

cd /app/server

# Prisma Client 생성 (항상 실행)
echo "📦 Generating Prisma Client..."
npx prisma generate

# 개발 환경: 마이그레이션 파일이 없으면 db push, 있으면 migrate deploy
if [ "$NODE_ENV" = "development" ]; then
  echo "🔧 Development mode: Checking migration status..."
  
  # migrations 폴더가 있고 파일이 있으면 migrate deploy 사용
  if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "📋 Found migration files, running migrate deploy..."
    npx prisma migrate deploy || {
      echo "⚠️  migrate deploy failed, trying db push as fallback..."
      npx prisma db push --accept-data-loss
    }
  else
    echo "📋 No migration files found, using db push (development only)..."
    npx prisma db push --accept-data-loss || {
      echo "⚠️  db push failed, trying migrate dev..."
      npx prisma migrate dev --name init --skip-seed || true
    }
  fi
else
  # 프로덕션 환경: migrate deploy만 사용
  echo "🏭 Production mode: Running migrate deploy..."
  npx prisma migrate deploy
fi

# 시드 데이터 실행 (개발 환경에서만, 선택사항)
if [ "$NODE_ENV" = "development" ] && [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Running seed data..."
  npx prisma db seed || echo "⚠️  Seed failed or not configured"
fi

echo "✅ Database initialization complete!"
echo "🎯 Starting server..."

# 원래 명령 실행
exec "$@"

