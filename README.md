
# StabiLink — сайт

## Запуск локально
```bash
npm i
npm run dev
```

## Деплой на Vercel
1. Создайте репозиторий на GitHub и загрузите туда этот проект.
2. На https://vercel.com -> New Project -> Import GitHub Repo -> `stabilink-site`.
3. Framework: **Vite** (авто), Build Command: `npm run build`, Output: `dist`.
4. Deploy.

## Деплой на Netlify (альтернатива)
- New site from Git -> GitHub -> Repo -> Build: `npm run build`, Publish directory: `dist`.

## Где менять ссылки
- Все CTA ведут на https://t.me/stabilink (ищите по проекту строку `t.me/stabilink`).


## Иллюстрации
- Главная: `public/illustrations/hero.png` (заменяем при необходимости своей).
- Общий сет: `public/illustrations/set.png` (используется в «О проекте»).
