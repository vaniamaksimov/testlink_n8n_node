# Деплой кастомных n8n нод через GitLab Package Registry

## Общая схема

```
 ┌──────────────────────┐     ┌──────────────────────┐
 │  n8n-nodes-testlink  │     │  n8n-nodes-jira-extra│
 │  (git tag v1.2.3)    │     │  (git tag v2.1.0)    │
 └─────────┬────────────┘     └─────────┬────────────┘
           │ npm publish                 │ npm publish
           ▼                             ▼
 ┌──────────────────────────────────────────────────────┐
 │          GitLab Package Registry                     │
 │  @scope/n8n-nodes-testlink@1.2.3                     │
 │  @scope/n8n-nodes-jira-extra@2.1.0                   │
 └──────────────────────┬──────────────────────────────┘
                        │ trigger
                        ▼
              ┌─────────────────────┐
              │     n8n-deploy      │
              │  package.json       │
              │  Dockerfile         │
              │  .gitlab-ci.yml     │
              └─────────┬───────────┘
                        │ docker build + deploy
                        ▼
              ┌─────────────────────┐
              │     VM с n8n        │
              └─────────────────────┘
```

Каждая кастомная нода — отдельный репозиторий. По git-тегу нода публикуется в GitLab Package Registry и триггерит деплой n8n.

## 1. Настройка репозитория ноды

### `.npmrc` в корне репозитория

```
@your-scope:registry=https://gitlab.example.com/api/v4/projects/${CI_PROJECT_ID}/packages/npm/
//gitlab.example.com/api/v4/projects/${CI_PROJECT_ID}/packages/npm/:_authToken=${CI_JOB_TOKEN}
```

### `package.json` — имя пакета со scope

```json
{
  "name": "@your-scope/n8n-nodes-testlink",
  "version": "1.0.0",
  "n8n": {
    "n8nNodesPackageName": "n8n-nodes-testlink"
  }
}
```

Scope (`@your-scope`) должен совпадать с именем группы или проекта в GitLab — это требование GitLab npm registry.

### `.gitlab-ci.yml` ноды

```yaml
stages:
  - test
  - publish
  - trigger

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run lint
    - npm run build
    - npm test
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_TAG

publish:
  stage: publish
  image: node:20
  script:
    - npm ci
    - npm run build
    - npm publish
  rules:
    - if: $CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/

trigger-deploy:
  stage: trigger
  trigger:
    project: your-group/n8n-deploy
    branch: main
  rules:
    - if: $CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/
```

Процесс: пуш git-тега `v1.2.3` → тесты → публикация в registry → триггер деплоя n8n.

## 2. Репозиторий `n8n-deploy`

Отдельный репозиторий, который собирает и деплоит n8n со всеми кастомными нодами.

### `package.json` (манифест нод)

```json
{
  "name": "n8n-custom-nodes",
  "private": true,
  "dependencies": {
    "@your-scope/n8n-nodes-testlink": "^1.0.0",
    "@your-scope/n8n-nodes-jira-extra": "^2.1.0"
  }
}
```

Единственное место, где фиксируются версии всех нод. Добавление новой ноды — одна строка.

### `.npmrc` для чтения из registry

Для нод из разных проектов удобнее использовать group-level registry — один URL для всей группы:

```
@your-scope:registry=https://gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/
//gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/:_authToken=${CI_JOB_TOKEN}
```

## 3. Варианты деплоя

### Вариант A: Docker-образ

**`Dockerfile`:**

```dockerfile
FROM n8nio/n8n:latest

USER root

COPY package.json .npmrc /tmp/custom-nodes/
RUN cd /tmp/custom-nodes && \
    npm install --production && \
    cp -r node_modules/@your-scope/* /usr/local/lib/node_modules/n8n/node_modules/ && \
    rm -rf /tmp/custom-nodes

USER node
```

**`.gitlab-ci.yml`:**

```yaml
deploy:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t registry.gitlab.example.com/your-group/n8n-deploy:${CI_COMMIT_SHORT_SHA} .
    - docker push registry.gitlab.example.com/your-group/n8n-deploy:${CI_COMMIT_SHORT_SHA}
    - ssh deploy@vm "cd /opt/n8n && docker compose pull && docker compose up -d"
```

### Вариант B: Прямая установка на VM

```yaml
deploy:
  stage: deploy
  script:
    - ssh deploy@vm "
        cd /opt/n8n-custom-nodes &&
        npm install --production &&
        systemctl restart n8n
      "
```

n8n запускается с переменной окружения:

```
N8N_CUSTOM_EXTENSIONS=/opt/n8n-custom-nodes/node_modules/@your-scope/n8n-nodes-testlink
```

## 4. Обновление версий нод

Два подхода:

- **Автоматический** — `trigger-deploy` в CI ноды триггерит пайплайн `n8n-deploy`, который делает `npm update` и деплоит. Подходит для dev/staging.
- **Контролируемый** — разработчик вручную обновляет версию в `package.json` репозитория `n8n-deploy` и пушит. Подходит для production.

Можно совместить: триггер автоматически создаёт MR в `n8n-deploy` с обновлённой версией, а мержит человек.
