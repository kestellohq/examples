<?php

declare(strict_types=1);

namespace Plugins\Hello;

use Kestello\Framework\Database\QueryBuilder;
use Kestello\Framework\Settings\Settings;

/**
 * Greetings are stored in this plugin's own table (p_hello_greetings).
 * How they are worded comes from the plugin's settings tab
 * (Settings → Hello in the admin, stored as plugin.hello.greeting.*).
 */
final class Greetings
{
    public function record(string $name): int
    {
        return (int) QueryBuilder::table('p_hello_greetings')->insert([
            'name' => mb_substr(trim($name), 0, 40),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    public function count(): int
    {
        return QueryBuilder::table('p_hello_greetings')->count();
    }

    /** Greetings addressed to one name (case-insensitive). */
    public function countFor(string $name): int
    {
        return QueryBuilder::table('p_hello_greetings')->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->count();
    }

    /** @return list<array{id: int, name: string, created_at: ?string}> */
    public function recent(int $limit = 20): array
    {
        return array_map(
            static fn(array $r) => ['id' => (int) $r['id'], 'name' => (string) $r['name'], 'created_at' => $r['created_at']],
            QueryBuilder::table('p_hello_greetings')->orderByDesc('id')->limit($limit)->get(),
        );
    }

    public function today(): int
    {
        return QueryBuilder::table('p_hello_greetings')->where('created_at', '>=', date('Y-m-d 00:00:00'))->count();
    }

    /** "Hello, Ada!" in the wording chosen in the settings tab. */
    public function phrase(string $name): string
    {
        $s = Settings::getInstance();
        $text = sprintf('%s, %s%s', (string) $s->get('plugin.hello.greeting.salutation', 'Hello'), $name, (string) $s->get('plugin.hello.greeting.punctuation', '!'));

        return filter_var($s->get('plugin.hello.greeting.shout', false), FILTER_VALIDATE_BOOLEAN) ? mb_strtoupper($text) : $text;
    }
}
