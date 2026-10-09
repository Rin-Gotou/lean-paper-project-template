.PHONY: build test paper check clean

build:
	lake build

test: build
	lake env lean Tests/Basic.lean

paper:
	npm run check:paper

check: test
	$(MAKE) paper

clean:
	lake clean
