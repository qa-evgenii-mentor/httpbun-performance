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
- `examples/httpbun-explore.js` - дополнительный обзор возможностей Httpbun.
- `.env.example` - шаблон переменных для Grafana Cloud и настройки нагрузки.

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

Создай локальный `.env`:

Заполни в `.env`:

```text
K6_CLOUD_TOKEN=...
K6_CLOUD_PROJECT_ID=...
```

PowerShell сам не подгружает `.env`, поэтому перед запуском тестов выстави переменные окружения:

```powershell
$env:K6_CLOUD_TOKEN="..."
$env:K6_CLOUD_PROJECT_ID="..."
$env:BASE_URL="https://httpbun.com"
```

Можно один раз авторизоваться командой:

```powershell
k6 login cloud --token $env:K6_CLOUD_TOKEN
```

После этого запускай сценарии через `k6 cloud`.

## Запуск сценариев

Smoke test:

```powershell
k6 cloud k6/01-smoke.js
```

Load test:

```powershell
k6 cloud k6/02-load.js
```

Stress test:

```powershell
k6 cloud k6/03-stress.js
```

Spike test:

```powershell
k6 cloud k6/04-spike.js
```

Soak test:

```powershell
$env:DURATION="30m"
k6 cloud k6/05-soak.js
```

Первая простая нагрузка на одну ручку:

```powershell
k6 cloud k6/06-single-endpoint.js
```

Учебный бизнес-сценарий:

```powershell
k6 cloud k6/07-business-flow.js
```

После запуска k6 напечатает ссылку на test run в Grafana Cloud.

## Настройка нагрузки

Некоторые сценарии читают параметры из переменных окружения:

```powershell
$env:VUS="10"
$env:DURATION="2m"
$env:TARGET_VUS="20"
$env:RAMP_UP="1m"
$env:HOLD="5m"
$env:RAMP_DOWN="1m"
```

Запись вида `Number(__ENV.VUS || 5)` означает: возьми `VUS` из окружения, а если его нет, используй `5`. Все такие переменные перечислены в `.env.example`.

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
$env:BASE_URL="https://httpbun.com"
```
