# Turnaround Splitter

Нарезка turnaround-листа 2×3 на шесть PNG. Отдельный репозиторий и отдельный проект на Vercel.

## Деплой на Vercel

1. Репозиторий на GitHub: `tool-turnaround-splitter`.
2. Залейте **содержимое этой папки**:

   ```bash
   cd tool-turnaround-splitter
   git init
   git add .
   git commit -m "Initial turnaround splitter"
   git remote add origin git@github.com:YOU/tool-turnaround-splitter.git
   git push -u origin main
   ```

3. Vercel → **Add New Project** → импорт репозитория.
4. Framework: **Other**, сборка не нужна.
5. Deploy.

6. Обновите URL в двух местах:
   - `config.js` → `TOOLS_HUB_URL` (ссылка «Все инструменты»)
   - В репозитории **tools-hub** → `tools.json` → поле `url` для этого инструмента

## Локально

```bash
python -m http.server 8766
```

http://127.0.0.1:8766 — хаб на порту 8765 (`tools-hub`).

## CLI (опционально)

```bash
pip install opencv-python
python split_turnaround.py
```

Положите `turnaround.png` в корень папки.
