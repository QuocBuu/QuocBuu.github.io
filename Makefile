PORT     ?= 4000
GEM_VOL  := /tmp/jekyll-gems
DOCKER   := docker run --rm -v "$(PWD)":/site -v $(GEM_VOL):/usr/local/bundle -w /site ruby:3.0

default:
	@bundle install

update:
	@bundle update

clean:
	@bundle exec jekyll clean

build: clean
	@bundle exec jekyll build --profile

server: clean
	@bundle exec jekyll server --livereload

theme:
	@gem uninstall jekyll-rtd-theme
	@rm -f *.gem
	@gem build *.gemspec && gem install *.gem

publish:
	@gem push *.gem
	@gem push --key github --host https://rubygems.pkg.github.com/rundocs *.gem

# ── Local preview (Docker build + Python server) ─────────────────────────────
preview:
	@echo ">>> Killing any process on port $(PORT)..."
	@fuser -k $(PORT)/tcp 2>/dev/null || true
	@echo ">>> Building site with Docker..."
	@$(DOCKER) bash -c "rm -f Gemfile.lock && bundle install 2>&1 | tail -1 && bundle exec jekyll build 2>&1 | tail -5"
	@echo ">>> Starting preview server at http://100.71.183.55:$(PORT)"
	@python3 -m http.server $(PORT) --directory _site &>/tmp/preview-$(PORT).log &
	@sleep 0.5
	@echo ""
	@echo "┌─────────────────────────────────────────────┐"
	@echo "│            Preview URLs                     │"
	@echo "├─────────────────────────────────────────────┤"
	@printf "│  %-10s http://%-26s│\n" "Local"     "localhost:$(PORT)"
	@ip -4 addr show scope global | awk '/inet /{print $$2}' | cut -d/ -f1 | while read ip; do \
	  label="LAN"; \
	  echo "$$ip" | grep -q "^100\." && label="Tailscale"; \
	  printf "│  %-10s http://%-26s│\n" "$$label" "$$ip:$(PORT)"; \
	done
	@echo "└─────────────────────────────────────────────┘"
