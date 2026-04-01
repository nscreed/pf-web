.PHONY: setup dev build

# First time setup
setup:
	@test -f .env.local || (cp .env.example .env.local && echo "✓ Created .env.local")
	npm install
	@echo ""
	@echo "✓ Setup done! Run: make dev"
	@echo "   (Make sure backend is running first: cd ../pf-backend && make dev)"

# Start dev server (port 3030)
dev:
	@test -f .env.local || cp .env.example .env.local
	npm run dev

# Production build
build:
	npm run build
