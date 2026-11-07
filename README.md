# Kestello examples

Example plugins and themes for [Kestello](https://github.com/kestellohq/cms), to read and to copy from. They follow Kestello's develop branch and are tested against it every week.

| Example | What it shows |
| --- | --- |
| [`plugins/hello`](plugins/hello) | One of each thing, small: a route and Vue page, a migration, shared page data, a filter, an event listener, a command, a background job, API endpoints, and an admin side built on them (a page, a dashboard widget, a People column, a Person panel and a settings tab). |
| [`plugins/catalog`](plugins/catalog) | A real plugin on public extension points only: content types and a taxonomy, its own tables, permissions, API endpoints, admin screens, a block, a binding source, a template and a pattern, a scheduled job with a notification, events, a webhook, and a test that takes it from install to uninstall on SQLite, MySQL and PostgreSQL. |
| [`plugins/mail-log`](plugins/mail-log) | Replacing a core contract: a mail transport that writes every email to a log file instead of sending it. Useful in development. |
| [`themes/base-child`](themes/base-child) | A child theme: inherits everything from Base and overrides the About page and the hello plugin's greeting page. |

The [plugin tutorial](https://docs.kestello.com/developers/plugin-tutorial) walks through writing a plugin from nothing; these are the finished shapes.

## Try one

Link an example into your local site and turn it on:

```sh
ln -s "$PWD/plugins/hello" ../cms/content/plugins/hello
docker exec cms_app php bin/cms plugin:activate hello
```

A theme goes in `content/themes` and is chosen in **Appearance > Themes**.

## Develop

You need PHP 8.4 or newer, Node.js LTS and Git. Nothing is installed with Composer.

```sh
sh tools/setup.sh                 # Kestello in kestello/ (a link to ../cms, or a clone), its PHP tools and npm packages
sh tools/check.sh                 # syntax, code style, PHPStan, tests and plugin:check for every example
sh tools/check.sh plugins/catalog # one example
sh tools/build.sh                 # rebuild the Vue pages after changing a .vue file, then commit assets/build
```

Built pages under `assets/build/` are committed, like in Kestello, so a site never needs Node.js. Run `sh tools/build.sh` from this folder: CI rebuilds and fails when the committed files differ.

## License

GPL-2.0-or-later, like Kestello. See [LICENSE](LICENSE).
