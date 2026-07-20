# k6 + Grafana Cloud course lab for Httpbun

Мини-стенд для практики нагрузочного тестирования на публичном сервисе [httpbun.com](https://httpbun.com/).

Основной способ запуска для курса: локальный `k6 cloud`. Результаты появляются в Grafana Cloud, локальные Prometheus и Grafana не нужны.

## Что внутри

- `k6/01-smoke.js` - быстрая проверка, что сервис отвечает.
- `k6/02-load.js` - обычная ожидаемая нагрузка.
- `k6/03-stress.js` - постепенное увеличение нагрузки.
- `k6/04-spike.js` - резкий скачок трафика.
- `k6/05-soak.js` - длительная стабильная нагрузка.
- `k6/06-single-endpoint.js` - первая простая нагрузка на одну ручку.
- `k6/07-business-flow.js` - учебный бизнес-сценарий: поиск и создание заказа.

## Установка k6

На Windows проще всего поставить k6 через `winget`:

```powershell
winget install k6.k6
```

Проверь установку:

```powershell
k6 version
```

## Авторизация в Grafana Cloud

Один раз авторизуйся в Grafana Cloud k6:

```powershell
k6 cloud login
```

После этого k6 попросит token:

```text
Enter your token to authenticate with Grafana Cloud k6.
Please, consult the Grafana Cloud k6 documentation for instructions on how to generate one:
https://grafana.com/docs/grafana-cloud/testing/k6/author-run/tokens-and-cli-authentication

  Token:
Logged in successfully, token saved in C:\Users\evgen\AppData\Roaming\k6\config.json
```

Token сохранится в локальный config k6. После этого запускай сценарии через `k6 cloud run`.

Project id для Grafana Cloud берется из переменной `K6_CLOUD_PROJECT_ID`:

```javascript
const CLOUD_PROJECT_ID = Number(__ENV.K6_CLOUD_PROJECT_ID || 8104573);

cloud: {
  projectID: CLOUD_PROJECT_ID,
}
```

Если переменная не задана, сценарий использует project `8104573`. Это защищает от ситуации, когда k6 отправляет результат в default project аккаунта.

Для учеников самый понятный способ передавать настройки - через флаг `-e` в команде запуска:

```powershell
k6 cloud run -e K6_CLOUD_PROJECT_ID=8104573 k6/01-smoke.js
```

## Запуск сценариев

Smoke test:

```powershell
k6 cloud run k6/01-smoke.js
```

Load test:

```powershell
k6 cloud run k6/02-load.js
```

Stress test:

```powershell
k6 cloud run k6/03-stress.js
```

Spike test:

```powershell
k6 cloud run k6/04-spike.js
```

Soak test:

```powershell
k6 cloud run -e DURATION=30m k6/05-soak.js
```

Первая простая нагрузка на одну ручку:

```powershell
k6 cloud run k6/06-single-endpoint.js
```

Учебный бизнес-сценарий:

```powershell
k6 cloud run k6/07-business-flow.js
```

После запуска k6 напечатает ссылку на test run в Grafana Cloud.

## Ежедневный запуск в GitHub Actions

В репозитории есть workflow `.github/workflows/daily-k6.yml`. Он запускает `k6/01-smoke.js` каждый день по расписанию и вручную через кнопку `Run workflow`.

Для работы workflow добавь в GitHub:

- Secret `K6_CLOUD_TOKEN` - token из Grafana Cloud k6.
- Variable `K6_CLOUD_PROJECT_ID` - например `8104573`.
- Variable `BASE_URL` - например `https://httpbun.com`.

Путь в GitHub: `Settings` -> `Secrets and variables` -> `Actions`.

## Настройка нагрузки

Некоторые сценарии читают параметры из переменных окружения. Передаем их явно через `-e`, чтобы было видно, что именно влияет на запуск:

```powershell
k6 cloud run `
  -e BASE_URL=https://httpbun.com `
  -e K6_CLOUD_PROJECT_ID=8104573 `
  -e VUS=10 `
  -e DURATION=2m `
  k6/06-single-endpoint.js
```

Запись вида `Number(__ENV.VUS || 5)` означает: возьми `VUS` из окружения, а если его нет, используй `5`.

В этом проекте используются такие переменные:

- `BASE_URL` - адрес тестируемого сервиса, по умолчанию `https://httpbun.com`.
- `K6_CLOUD_PROJECT_ID` - project id в Grafana Cloud, по умолчанию `8104573`.
- `VUS` - количество виртуальных пользователей в `05-soak.js` и `06-single-endpoint.js`.
- `DURATION` - длительность теста в `05-soak.js` и `06-single-endpoint.js`.

Профили `load`, `stress` и `spike` специально описаны прямо в файлах сценариев через `stages`, чтобы ученики видели форму нагрузки в коде.

## Что такое tags

`tags` в k6 - это метки для метрик. Например:

```javascript
http.get(`${BASE_URL}/get`, {
  tags: { name: "GET /users imitation" },
});
```

Без такого тега Grafana может показывать много похожих URL с разными query params. С тегом `name` в результатах проще увидеть один понятный endpoint или шаг сценария: `GET /users imitation`, `POST /orders imitation` и так далее.

`tags` помогают красиво группировать запросы в Grafana Cloud.

## Пример учебной задачи

Через две недели запускается рекламная кампания. Ожидается рост трафика в 3 раза. Нужно проверить, выдерживают ли поиск по каталогу и создание заказа базовую нагрузку без роста ошибок и с приемлемым p95.

Перед запуском фиксируем:

- Цель теста: проверить стабильность основных API-сценариев перед кампанией.
- Сценарии: поиск в каталоге, передача auth context, создание заказа.
- Профиль нагрузки: load test, затем spike test.
- Критерии успеха: error rate ниже 3%, p95 ниже 900 ms, checks выше 95%.
- Стенд: публичный Httpbun или self-hosted Httpbun для интенсивных прогонов.
- Результаты: ссылка на Grafana Cloud run и короткий отчет.

## Шаблон отчета

```markdown
# Load Test Report

## Цель

Что проверяли и почему.

## Стенд

URL, окружение, откуда запускали тест, версия сценария.

## Профиль нагрузки

Тип теста, VU, длительность, ramp-up/ramp-down.

## Сценарии

Какие endpoint'ы или бизнес-действия имитировали.

## Критерии успеха

p95, error rate, checks, RPS или другие важные ограничения.

## Результаты

Ссылка на Grafana Cloud run, ключевые цифры, графики.

## Проблемы

Ошибки, рост latency, нестабильность, ограничения стенда.

## Вывод

Можно ли идти дальше, что проверить или улучшить.
```

## Важное про публичный сервис

`httpbun.com` подходит для обучения, но не стоит атаковать публичный сервис большими профилями нагрузки. В рамках курса держим профили небольшими: короткая длительность, умеренное количество VU, понятные thresholds.

```powershell
k6 cloud run -e BASE_URL=https://httpbun.com k6/01-smoke.js
```
