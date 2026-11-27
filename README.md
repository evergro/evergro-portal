### Evergro Portal

The customer app for Evergro Landscapers, on Frappe/ERPNext v15. Customers log in at `/portal` to see their lawn care visits, manage their card, pay invoices and keep their details up to date. The public landing page is at `/`.

Start with [`docs/index.md`](docs/index.md). Contributors and agents read [`AGENTS.md`](AGENTS.md), [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`specs/`](specs/README.md).

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app portal
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/portal
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

agpl-3.0
