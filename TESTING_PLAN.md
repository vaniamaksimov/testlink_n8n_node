# План тестирования n8n-nodes-testlink

## Текущее состояние

Реализованы unit-тесты для всех 12 операций в 6 хендлерах (`nodes/TestLink/handlers/__tests__/*.test.ts`).
Покрыто: вызов правильного XML-RPC метода с правильными параметрами.

---

## Фаза 1: Расширение unit-тестов

### 1.1 Тесты для `GenericFunctions.ts`

Файл содержит два компонента: `buildParams()` и `testLinkApiRequest()`.

**`buildParams` (внутренняя функция — тестируем косвенно через `testLinkApiRequest`):**
- Фильтрация `undefined`, `null`, пустой строки из параметров
- Добавление `devKey` в payload
- `devKey` не перезаписывается пользовательским параметром

**`testLinkApiRequest`:**
- Мокаем `xmlrpc.createClient` — подменяем `methodCall`
- Проверяем формирование URL: `host + '/lib/api/xmlrpc/v1/xmlrpc.php'`
- Проверяем удаление trailing slash из `host`
- Проверяем вызов `client.methodCall(method, [payload], callback)`
- Проверяем обработку ошибок: `faultString`, `message`, unknown error

**Файлы:**
- `nodes/TestLink/__tests__/GenericFunctions.test.ts` — новый

### 1.2 Тесты для `TestLink.node.ts` (execute dispatch)

Проверяем логику маршрутизации в `execute()`:
- Правильный хендлер вызывается для каждой пары `resource` + `operation`
- Ошибка при неизвестном `resource`
- Ошибка при неизвестной `operation`
- `continueOnFail` — ошибка попадает в `returnData` как `{ error: message }`
- Итерация по нескольким `items`

Мокаем все модули хендлеров и `GenericFunctions`.

**Файлы:**
- `nodes/TestLink/__tests__/TestLink.node.test.ts` — новый

### 1.3 Edge-кейсы в хендлерах

Дополнить существующие тесты:
- Пустой ответ от API (пустой массив, `undefined`)
- API возвращает ошибку — проброс исключения

---

## Фаза 2: Интеграционные тесты с TestContainers

### 2.1 Концепция

Поднимаем реальный TestLink + MariaDB через [Testcontainers for Node.js](https://node.testcontainers.org/) и `DockerComposeEnvironment`. Тесты вызывают реальный XML-RPC API TestLink и проверяют end-to-end поведение.

### 2.2 Docker-образ TestLink

Bitnami `testlink` — **deprecated** (Bitnami прекратил поддержку каталога в августе 2025). Варианты:

| Образ | Статус | Примечание |
|-------|--------|------------|
| `bitnami/testlink:1.9.20` | Legacy, без обновлений | Работает, но без патчей безопасности |
| `bitnamilegacy/testlink` | Архив | То же, перемещён в legacy registry |

Для **тестового окружения** (не production) использование legacy-образа допустимо. Если в будущем появится community-образ — заменить.

### 2.3 Структура

```
integration/
  docker-compose.yml        # TestLink + MariaDB
  globalSetup.ts            # Поднимает контейнеры перед всеми тестами
  globalTeardown.ts         # Останавливает контейнеры
  helpers/
    seedTestLink.ts         # Создаёт тестовый проект, план, кейсы через API
  __tests__/
    testProject.integration.test.ts
    testPlan.integration.test.ts
    testSuite.integration.test.ts
    testCase.integration.test.ts
    build.integration.test.ts
    execution.integration.test.ts
```

### 2.4 docker-compose.yml

```yaml
services:
  mariadb:
    image: bitnami/mariadb:10.6
    environment:
      - MARIADB_ROOT_PASSWORD=root
      - MARIADB_USER=testlink
      - MARIADB_PASSWORD=testlink
      - MARIADB_DATABASE=testlink
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 10

  testlink:
    image: bitnami/testlink:1.9.20
    depends_on:
      mariadb:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      - TESTLINK_DATABASE_HOST=mariadb
      - TESTLINK_DATABASE_USER=testlink
      - TESTLINK_DATABASE_PASSWORD=testlink
      - TESTLINK_DATABASE_NAME=testlink
      - TESTLINK_USERNAME=admin
      - TESTLINK_PASSWORD=admin
      - TESTLINK_EMAIL=admin@example.com
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 10s
      timeout: 5s
      retries: 15
```

### 2.5 globalSetup.ts — TestContainers

```typescript
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import path from 'path';

export default async function () {
  const composeFilePath = path.resolve(__dirname);
  const environment = await new DockerComposeEnvironment(composeFilePath, 'docker-compose.yml')
    .withWaitStrategy('testlink-1', Wait.forHealthCheck())
    .up();

  const testlinkContainer = environment.getContainer('testlink-1');
  const host = testlinkContainer.getHost();
  const port = testlinkContainer.getMappedPort(8080);

  // Передаём URL и API key через глобальные переменные
  (globalThis as any).__TESTLINK_URL__ = `http://${host}:${port}`;
  (globalThis as any).__COMPOSE_ENV__ = environment;
}
```

### 2.6 globalTeardown.ts

```typescript
export default async function () {
  const environment = (globalThis as any).__COMPOSE_ENV__;
  if (environment) {
    await environment.down();
  }
}
```

### 2.7 jest.integration.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/integration/**/*.integration.test.ts'],
  globalSetup: './integration/globalSetup.ts',
  globalTeardown: './integration/globalTeardown.ts',
  testTimeout: 30000,
};
```

### 2.8 Seed-скрипт

Перед тестами через XML-RPC API создаём тестовые данные:
1. Создать test project (`tl.createTestProject`)
2. Создать test plan (`tl.createTestPlan`)
3. Создать test suite (`tl.createTestSuite`)
4. Создать test case (`tl.createTestCase`)
5. Добавить test case в test plan (`tl.addTestCaseToTestPlan`)
6. Создать build (`tl.createBuild`)

API key генерируется через `tl.doesUserExist` + `tl.getUserByLogin`, либо задаётся через переменные окружения TestLink при старте.

### 2.9 Что проверяем

| Тест | Описание |
|------|----------|
| testProject.getAll | Возвращает массив с seed-проектом |
| testProject.get | Находит проект по имени |
| testPlan.getAll | Возвращает планы для проекта |
| testPlan.get | Находит план по имени |
| testSuite.getAll | Возвращает top-level suites |
| testSuite.get | Находит suite по ID |
| testCase.get | Возвращает кейс по ID |
| testCase.getAll | Возвращает кейсы для suite |
| build.getAll | Возвращает билды для плана |
| build.create | Создаёт новый билд, проверяет ответ |
| execution.report | Отправляет результат, проверяет статус |
| execution.getLast | Получает последний результат для кейса |

### 2.10 npm-скрипт

```json
"test:integration": "jest --config jest.integration.config.js --runInBand"
```

`--runInBand` — тесты выполняются последовательно, т.к. работают с общим состоянием TestLink.

---

## Фаза 3: CI/CD

### 3.1 Unit-тесты в CI

Добавить GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
```

### 3.2 Интеграционные тесты в CI

```yaml
  integration:
    runs-on: ubuntu-latest
    needs: unit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:integration
```

Docker доступен на `ubuntu-latest` по умолчанию — TestContainers работают из коробки.

---

## Порядок реализации

| # | Задача | Зависимости | Файлы |
|---|--------|-------------|-------|
| 1 | Unit-тесты GenericFunctions | — | `nodes/TestLink/__tests__/GenericFunctions.test.ts` |
| 2 | Unit-тесты TestLink.node.ts | — | `nodes/TestLink/__tests__/TestLink.node.test.ts` |
| 3 | Edge-кейсы хендлеров | — | `nodes/TestLink/handlers/__tests__/*.test.ts` |
| 4 | npm install testcontainers | — | `package.json` |
| 5 | docker-compose + globalSetup/Teardown | #4 | `integration/` |
| 6 | Seed-скрипт | #5 | `integration/helpers/seedTestLink.ts` |
| 7 | Интеграционные тесты | #5, #6 | `integration/__tests__/*.integration.test.ts` |
| 8 | GitHub Actions | #1–#7 | `.github/workflows/test.yml` |
