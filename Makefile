# -----------------------------------------------------------------------------
# Standardized DevOps Makefile — obsidian-highlighter
#
# This Makefile is a thin "protocol layer". All real logic lives in dev.sh.
# Target names are kept aligned with the company-wide template so developers
# switching between projects can rely on the same commands everywhere.
#
# All build / lint / fmt / test commands run inside the dev container —
# the host only needs Docker, bash, and make.
# -----------------------------------------------------------------------------

SHELL := /bin/bash

# Output colors
G     := $(shell tput -Txterm setaf 2)
R     := $(shell tput -Txterm setaf 1)
Y     := $(shell tput -Txterm setaf 3)
RESET := $(shell tput -Txterm sgr0)

PROJECT_NAME := $(notdir $(CURDIR))

.PHONY: help \
        doctor deps \
        lint fmt test \
        build watch clean \
        up down restart status logs shell \
        artifacts install release

.DEFAULT_GOAL := help

## help: [帮助] 显示所有可用指令
help:
	@echo "Project: $(G)$(PROJECT_NAME)$(RESET)"
	@echo "Usage: make $(Y)<target>$(RESET)"
	@echo ""
	@echo "Available targets:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' |  sed -e 's/^/ /'

# --- 1. Environment ----------------------------------------------------------

## doctor: [环境] 检查 docker / docker compose / .env 是否就绪
doctor:
	@echo "$(G)[MAKE]==> Checking environment health...$(RESET)"
	@bash ./dev.sh doctor

## deps: [环境] 在容器内安装 npm 依赖
deps:
	@echo "$(G)[MAKE]==> Installing dependencies...$(RESET)"
	@bash ./dev.sh deps

# --- 2. Code quality ---------------------------------------------------------

## lint: [代码] 在容器内执行 eslint
lint:
	@echo "$(G)[MAKE]==> Running static analysis...$(RESET)"
	@bash ./dev.sh lint

## fmt: [代码] 在容器内执行 prettier
fmt:
	@echo "$(G)[MAKE]==> Formatting code...$(RESET)"
	@bash ./dev.sh fmt

## test: [测试] 在容器内执行 tsc --noEmit 类型检查
test:
	@echo "$(G)[MAKE]==> Running type check...$(RESET)"
	@bash ./dev.sh test

# --- 3. Build ----------------------------------------------------------------

## build: [构建] 在容器内执行 esbuild 生产构建 (依赖 lint)
build: lint
	@echo "$(G)[MAKE]==> Building project...$(RESET)"
	@bash ./dev.sh build

## watch: [构建] 在容器内启动 esbuild watch 模式 (Ctrl+C 退出)
watch:
	@echo "$(G)[MAKE]==> Starting watch mode...$(RESET)"
	@bash ./dev.sh watch

## clean: [构建] 清理构建产物 (--all 清理 node_modules 卷)
clean:
	@echo "$(G)[MAKE]==> Cleaning up...$(RESET)"
	@bash ./dev.sh clean

# --- 4. Container lifecycle --------------------------------------------------

## up: [运行] 启动 dev 容器 (docker compose up -d)
up:
	@echo "$(G)[MAKE]==> Starting dev container...$(RESET)"
	@bash ./dev.sh up

## down: [运行] 停止并移除 dev 容器
down:
	@echo "$(G)[MAKE]==> Stopping dev container...$(RESET)"
	@bash ./dev.sh down

## restart: [运行] 重启 dev 容器
restart:
	@echo "$(G)[MAKE]==> Restarting dev container...$(RESET)"
	@bash ./dev.sh restart

## status: [运行] 查看 dev 容器状态
status:
	@bash ./dev.sh status

## logs: [运行] 查看 dev 容器日志
logs:
	@bash ./dev.sh logs

## shell: [调试] 进入 dev 容器 shell
shell:
	@echo "$(G)[MAKE]==> Entering dev container...$(RESET)"
	@bash ./dev.sh shell

# --- 5. Artifacts & deploy ---------------------------------------------------

## artifacts: [测试] 检查并展示构建产物 (main.js / styles.css / manifest.json)
artifacts:
	@echo "$(G)[MAKE]==> Inspecting artifacts...$(RESET)"
	@bash ./dev.sh artifacts

## install: [发布] 将构建产物部署到 .env 中配置的 VAULT_PLUGIN_PATH
install:
	@echo "$(G)[MAKE]==> Installing plugin to vault...$(RESET)"
	@bash ./dev.sh install

# --- 6. Release --------------------------------------------------------------

## release: [发布] 更新版本号并打 tag — 用法 make release VERSION=1.1.0
release:
	@echo "$(G)[MAKE]==> Creating new release...$(RESET)"
	@bash ./dev.sh release $(VERSION)
