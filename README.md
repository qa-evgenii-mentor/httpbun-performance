# k6 + Grafana Cloud course lab for Httpbun

Мини-стенд для практики нагрузочного тестирования на публичном сервисе [httpbun.com](https://httpbun.com/).

Docker здесь используется только как runner для k6. Локальные Prometheus и Grafana не нужны: результаты отправляются в Grafana Cloud.

## Что внутри

- `docker-compose.yml` запускает контейнер `grafana/k6`.
- `k6/` - основной учебный маршрут, файлы пронумерованы по порядку запуска.
- `examples/httpbun-explore.js` - дополнительный обзор возможностей Httpbun: payload, mix, auth, cache, etag, redirects.
- `.env.example` - шаблон переменных для Grafana Cloud.

## Подготовка

Проверь Docker:

```powershell
docker --version
docker compose version
docker info
```

Если `docker --version` работает, но `docker info` пишет `failed to connect to the docker API at npipe:////./pipe/docker_engine`, открой Docker Desktop из Start Menu и дождись статуса `Docker Desktop is running`.

Создай локальный `.env`:

```powershell
Copy-Item .env.example .env
```

## Вариант A: Grafana Cloud k6

Это рекомендуемый вариант для курса: Grafana Cloud сам показывает test runs, checks, thresholds, latency и ошибки.

1. Открой Grafana Cloud.
2. Перейди в раздел `Testing & synthetics` или `k6`.
3. Создай project или выбери существующий.
4. Создай API token для k6.
5. Заполни в `.env`:

```text
K6_CLOUD_TOKEN=...
K6_CLOUD_PROJECT_ID=...
```

Запуск smoke test:

```powershell
docker compose run --rm k6 cloud /scripts/01-smoke.js
```

Первая простая нагрузка на одну ручку:

```powershell
docker compose run --rm k6 cloud /scripts/02-single-endpoint.js
```

Основной учебный сценарий:

```powershell
docker compose run --rm k6 cloud /scripts/03-business-flow.js
```

Load test:

```powershell
docker compose run --rm k6 cloud /scripts/04-load.js
```

Spike test:

```powershell
docker compose run --rm k6 cloud /scripts/06-spike.js
```

Soak test:

```powershell
docker compose run --rm -e DURATION=30m k6 cloud /scripts/07-soak.js
```

Обзор возможностей Httpbun:

```powershell
docker compose run --rm k6 cloud /examples/httpbun-explore.js
```

Stress test:

```powershell
docker compose run --rm k6 cloud /scripts/05-stress.js
```

После запуска k6 напечатает ссылку на test run в Grafana Cloud.

## Вариант B: Grafana Cloud Metrics

Этот вариант полезен, если вы хотите строить свой dashboard в Grafana Cloud поверх Prometheus metrics.

В Grafana Cloud открой Prometheus details и скопируй:

- Remote write endpoint.
- Instance ID или username.
- API token с правами на metrics publish.

Заполни в `.env`:

```text
K6_PROMETHEUS_RW_SERVER_URL=https://prometheus-prod-XX.grafana.net/api/prom/push
K6_PROMETHEUS_RW_USERNAME=...
K6_PROMETHEUS_RW_PASSWORD=...
```

Запуск:

```powershell
docker compose run --rm k6 run -o experimental-prometheus-rw /scripts/httpbun-api-mix.js
```

В Grafana Cloud Explore выбери Prometheus datasource и проверь метрики:

```promql
k6_http_reqs_total
k6_http_req_duration_p95
k6_http_req_failed_rate
k6_checks_rate
```

## Идея маленького курса

1. Базовая модель k6: VU, iteration, checks, thresholds.
2. HTTP минимум: methods, headers, status codes, body, auth context, assertions.
3. Первый запуск: одна простая ручка, чтобы участник получил результат за 10 минут.
4. Реальная задача: рекламная кампания, рост трафика, поиск в каталоге и создание заказа.
5. Метрики: p95/p99, RPS, error rate, checks, thresholds.
6. Виды нагрузки: load, stress, spike, soak.
7. Удаленный запуск: тот же Docker/k6 workflow на VPS.
8. Итоговый отчет: цель, стенд, профиль, результаты, проблемы, выводы.

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

`httpbun.com` подходит для обучения, но не стоит атаковать публичный сервис большими профилями нагрузки. Для интенсивных прогонов лучше поднять локальный Httpbun и поменять `BASE_URL`:

```powershell
docker run --rm -p 8080:80 sharat87/httpbun
```

```text
BASE_URL=http://host.docker.internal:8080
```
