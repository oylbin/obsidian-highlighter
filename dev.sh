#!/bin/bash
# -----------------------------------------------------------------------------
# obsidian-highlighter — dev.sh
#
# Logic-bearing script behind the Makefile.
# All real work (docker, npm, file ops) happens here so the Makefile can stay
# a thin "protocol layer" with stable target names that match other projects.
#
# Philosophy: 入口标准化，逻辑脚本化 (standardized entry, scripted logic).
# All build/lint/fmt/test commands run *inside* the dev container — never on
# the host. The host only needs Docker, bash, and make.
# -----------------------------------------------------------------------------

set -e

SCRIPTDIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPTDIR"

# --- Constants ---------------------------------------------------------------

COMPOSE="docker compose"
SERVICE="dev"

# --- OS detection (kept for parity with the template; mostly informational) --

if [ "$OS" = "Windows_NT" ]; then
    OS_TYPE="Windows"
else
    OS_TYPE="$(uname -s)"
fi

# --- Logging -----------------------------------------------------------------

info()  { echo -e "\033[32m[INFO] [dev.sh] $1\033[0m"; }
warn()  { echo -e "\033[33m[WARN] [dev.sh] $1\033[0m"; }
error() { echo -e "\033[31m[ERROR] [dev.sh] $1\033[0m"; exit 1; }

# --- Env loading -------------------------------------------------------------

# Load .env if present (used by `install` for VAULT_PLUGIN_PATH).
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

# --- Helpers -----------------------------------------------------------------

# Ensure the dev container is running. Start it if not.
ensure_up() {
    if ! $COMPOSE ps --status running --services 2>/dev/null | grep -q "^${SERVICE}$"; then
        info "dev container not running, starting it..."
        $COMPOSE up -d
    fi
}

# Run a non-interactive command inside the dev container.
# -T disables TTY allocation so it works in MINGW64 / CI / piped contexts.
in_container() {
    ensure_up
    $COMPOSE exec -T "$SERVICE" "$@"
}

# Run an interactive command inside the dev container (watch / shell).
in_container_tty() {
    ensure_up
    $COMPOSE exec "$SERVICE" "$@"
}

# --- Command dispatch --------------------------------------------------------

COMMAND="$1"
shift || true

case "$COMMAND" in

    # --- 1. Environment ------------------------------------------------------

    doctor)
        info "OS detected: $OS_TYPE"

        info "Checking docker..."
        command -v docker >/dev/null 2>&1 || error "Docker is not installed or not in PATH."
        info "  docker: $(docker --version)"

        info "Checking docker compose v2..."
        if ! docker compose version >/dev/null 2>&1; then
            error "docker compose v2 not available. Please upgrade Docker Desktop or install the compose plugin."
        fi
        info "  $(docker compose version)"

        info "Checking .env..."
        if [ ! -f .env ]; then
            warn ".env not found. Copy .env.example to .env if you intend to use 'make install'."
        else
            info "  .env present."
            if [ -z "$VAULT_PLUGIN_PATH" ]; then
                warn "  VAULT_PLUGIN_PATH is empty in .env — 'make install' will fail until you set it."
            else
                info "  VAULT_PLUGIN_PATH=$VAULT_PLUGIN_PATH"
            fi
        fi

        info "Everything looks good."
        ;;

    deps)
        info "Installing npm dependencies inside container..."
        in_container npm install
        info "Dependencies installed."
        ;;

    # --- 2. Code quality -----------------------------------------------------

    lint)
        info "Running eslint..."
        in_container npm run lint
        ;;

    fmt)
        info "Running prettier..."
        in_container npm run format
        ;;

    test)
        # Project has no automated test suite; type-check is the closest
        # automated quality gate we can run.
        info "Running TypeScript type check (tsc --noEmit)..."
        in_container npx tsc --noEmit
        info "Type check passed."
        ;;

    # --- 3. Build ------------------------------------------------------------

    build)
        info "Building production bundle (esbuild)..."
        in_container npm run build
        info "Build done. Artifacts: main.js"
        ;;

    watch)
        info "Starting esbuild in watch mode (Ctrl+C to stop)..."
        # TTY mode so Ctrl+C reaches esbuild cleanly.
        in_container_tty npm run dev
        ;;

    clean)
        info "Removing build artifacts..."
        rm -f main.js
        rm -rf lib
        if [ "$1" = "--all" ]; then
            warn "Removing dev container and node_modules volume..."
            $COMPOSE down -v 2>/dev/null || true
            info "Full clean done. Run 'make deps' to reinstall."
        else
            info "Clean done. (Use 'bash ./dev.sh clean --all' to also drop node_modules volume.)"
        fi
        ;;

    # --- 4. Container lifecycle ---------------------------------------------

    up)
        info "Starting dev container..."
        $COMPOSE up -d
        $COMPOSE ps
        ;;

    down)
        info "Stopping dev container..."
        $COMPOSE down
        ;;

    restart)
        info "Restarting dev container..."
        $COMPOSE restart "$SERVICE"
        ;;

    status)
        $COMPOSE ps
        ;;

    logs)
        $COMPOSE logs -f "$SERVICE"
        ;;

    shell)
        info "Entering dev container shell..."
        in_container_tty sh
        ;;

    # --- 5. Artifacts & deploy ----------------------------------------------

    artifacts)
        info "Inspecting plugin artifacts..."
        missing=0
        for f in main.js styles.css manifest.json; do
            if [ -f "$f" ]; then
                size=$(wc -c < "$f" | tr -d ' ')
                printf "  \033[32m✓\033[0m %-15s %s bytes\n" "$f" "$size"
            else
                printf "  \033[31m✗\033[0m %-15s MISSING\n" "$f"
                missing=1
            fi
        done
        if [ "$missing" = "1" ]; then
            error "One or more artifacts missing. Run 'make build' first."
        fi
        info "All artifacts present."
        ;;

    install)
        if [ -z "$VAULT_PLUGIN_PATH" ]; then
            error "VAULT_PLUGIN_PATH not set. Copy .env.example to .env and configure it."
        fi
        for f in main.js styles.css manifest.json; do
            [ -f "$f" ] || error "$f not found. Run 'make build' first."
        done
        info "Installing plugin to: $VAULT_PLUGIN_PATH"
        mkdir -p "$VAULT_PLUGIN_PATH"
        cp main.js styles.css manifest.json "$VAULT_PLUGIN_PATH/"
        info "Installed. Reload Obsidian (Ctrl+R / Cmd+R) to apply changes."
        ;;

    # --- 6. Release ----------------------------------------------------------

    release)
        NEW_VERSION="$1"
        if [ -z "$NEW_VERSION" ]; then
            error "Usage: make release VERSION=<new-version>   e.g., make release VERSION=1.1.0"
        fi
        # Basic semver sanity check
        if ! echo "$NEW_VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.-]+)?$'; then
            error "Version '$NEW_VERSION' is not valid semver (expected X.Y.Z)."
        fi

        info "Bumping package.json + manifest.json to $NEW_VERSION..."
        in_container npm version "$NEW_VERSION" --no-git-tag-version --allow-same-version
        in_container node -e "
            const fs = require('fs');
            const m = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
            m.version = '$NEW_VERSION';
            fs.writeFileSync('manifest.json', JSON.stringify(m, null, '\t') + '\n');
        "

        info "Showing diff for review:"
        git --no-pager diff -- manifest.json package.json package-lock.json || true

        info "Committing and tagging..."
        git add manifest.json package.json package-lock.json
        git commit -m "chore: release v$NEW_VERSION"
        git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
        info "Tagged v$NEW_VERSION."
        warn "NOT pushed automatically. Run: git push && git push --tags"
        ;;

    # --- Fallback ------------------------------------------------------------

    "")
        error "No command given. Run 'make help' for the list of targets."
        ;;
    *)
        error "Unknown command: $COMMAND. Run 'make help' for the list of targets."
        ;;
esac
