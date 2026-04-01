.PHONY: setup dev build

# First time setup
setup:
	@test -f .env.local || cp .env.example .env.local && echo "Created .env.local from .env.example"
	npm install
	@echo ""
	@echo "Setup done! Run 'make dev' to start."

# Start dev server on port 3030
dev:
	@test -f .env.local || cp .env.example .env.local
	npm run dev

# Production build
build:
	npm run build
