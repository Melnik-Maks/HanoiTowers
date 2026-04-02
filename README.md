# Ханойські вежі

Повноцінний full-stack вебпроєкт на `Next.js App Router` для гри «Ханойські вежі» з реєстрацією дітей, ролями `child/admin`, JSON-рівнями, турнірами та leaderboard у реальному часі.

## Архітектура

Монолітний репозиторій, де frontend і backend живуть разом:

- `app/` — сторінки App Router і server actions
- `components/` — UI, форми, гра, турніри, layout
- `lib/` — auth, prisma, utils, realtime
- `services/` — бізнес-логіка рівнів, результатів, турнірів, leaderboard
- `prisma/` — Prisma schema та seed-скрипт
- `types/` — спільні типи TypeScript
- `hooks/` — клієнтські хуки
- `data/variants.json` — імпортований файл JSON-рівнів

## Технології

- Next.js 15 + App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- JWT-аутентифікація на cookie
- Socket.io для realtime-оновлень турніру
- Docker / Docker Compose

## Реалізовано

- Реєстрація дітей, вхід, вихід
- Захист маршрутів і ролей `child/admin`
- Seed адміністратора
- Класичні рівні від 3 до 8 дисків
- JSON-рівні з `variants.json`
- Helper-и:
  - `parseLevelFromJson`
  - `validateLevel`
  - `normalizeLevel`
  - `getRandomLevel`
  - `getLevelById`
- Збереження результатів гри в БД
- Створення турнірів адміністратором
- Приєднання дітей до турніру за коротким кодом
- Послідовне проходження рівнів турніру
- Блокування вже завершених рівнів турніру
- Leaderboard з потрібним сортуванням
- Realtime-оновлення сторінки турніру через Socket.io

## Сторінки

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/levels`
- `/levels/[id]`
- `/tournaments`
- `/tournaments/join`
- `/tournaments/[id]`
- `/admin`
- `/admin/tournaments`
- `/admin/tournaments/create`
- `/profile`

## Seed адміністратора

Після виконання seed у БД буде створено адміністратора:

- email: `admin@hanoi.local`
- password: `admin12345`
- role: `admin`

## Локальний запуск без Docker

1. Створіть `.env` на основі `.env.example`.
2. Підніміть PostgreSQL.
3. Встановіть залежності:
   - `npm install`
4. Згенеруйте Prisma Client:
   - `npm run prisma:generate`
5. Застосуйте міграцію або створіть БД через Prisma:
   - `npx prisma migrate dev --name init`
6. Створіть адміністратора:
   - `npm run prisma:seed`
7. Запустіть застосунок:
   - `npm run dev`

## Запуск через Docker

1. Заповніть `.env` або використайте значення з `.env.example`.
2. Запустіть стек:
   - `docker compose up --build`

Після старту застосунок буде доступний на `http://localhost:3000`.

## Перевірка

У цьому workspace виконано:

- `npm install`
- `npm run prisma:generate`
- `npm run build`

## Примітки

- `variants.json` імпортовано в `data/variants.json`.
- Для JSON-рівнів застосовується серверна валідація перед запуском.
- Турнір не стартує без рівнів.
- Після старту турніру редагування списку рівнів не передбачене.
- Завершений рівень турніру не можна пройти повторно.
