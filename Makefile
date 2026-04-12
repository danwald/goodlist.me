.PHONY: help build up down restart logs db-migrate db-studio clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Docker ────────────────────────────────────────────────────────────────────
build: ## Build all Docker containers
	docker compose build

up: ## Start all services (detached)
	docker compose up -d

up-attached: ## Start all services with logs
	docker compose up

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose down && docker compose up -d

logs: ## Tail logs from all services
	docker compose logs -f

logs-app: ## Tail app logs
	docker compose logs -f app

# ── Database ──────────────────────────────────────────────────────────────────
db-migrate: ## Run Prisma migrations inside the app container
	docker compose exec app npx prisma migrate dev

db-push: ## Push schema to database (no migration file)
	docker compose exec app npx prisma db push

db-studio: ## Open Prisma Studio
	docker compose exec app npx prisma studio

db-shell: ## Open a psql shell
	docker compose exec postgres psql -U app goodlist_dev

# ── App ───────────────────────────────────────────────────────────────────────
shell: ## Shell into app container
	docker compose exec app sh

lint: ## Lint the project
	docker compose exec app npm run lint

typecheck: ## Type-check the project
	docker compose exec app npx tsc --noEmit

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove containers, volumes, built images
	docker compose down -v --rmi local
