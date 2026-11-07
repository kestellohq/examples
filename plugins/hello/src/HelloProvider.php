<?php

declare(strict_types=1);

namespace Plugins\Hello;

use Kestello\Cms\Api\Schema;
use Kestello\Cms\Cms;
use Kestello\Cms\Events\UserLoggedIn;
use Kestello\Cms\Extension\PluginProvider;
use Kestello\Framework\Core\Container;
use Kestello\Framework\Log\Logger;

final class HelloProvider extends PluginProvider
{
    public function register(Container $container): void
    {
        $container->singleton(Greetings::class, fn() => new Greetings());
    }

    public function boot(Cms $cms): void
    {
        // A route rendering this plugin's own Vue page ("@hello/Greeting").
        $cms->routes->get('/hello/{name}', [GreetingController::class, 'show'])
            ->where(['name' => '[A-Za-z][A-Za-z0-9 -]{0,39}'])
            ->name('hello.show');

        // Data shared with every page (themes read usePage().props.hello.badge).
        $cms->pages->share('hello', fn(): array => [
            'badge' => sprintf('%d greetings served', $cms->container->make(Greetings::class)->count()),
        ]);

        // A filter on the page <head>.
        $cms->filters->add('page.head', fn(string $html): string => $html . '<meta name="hello-plugin" content="active">');

        // An event listener, queued: Listeners\LogLogin is marked #[Queued].
        $cms->events->on(UserLoggedIn::class, Listeners\LogLogin::class);

        // A background job (hello:greet <name> --later pushes it).
        $cms->queue->job(GreetJob::class);

        // A CLI command.
        $cms->console->command(Commands\GreetCommand::class);

        $this->bootAdmin($cms);
    }

    /**
     * The admin side, API first: the screens below only call the endpoints
     * registered here, so anything they do an integration can do too.
     */
    private function bootAdmin(Cms $cms): void
    {
        $greetings = $cms->container->make(Greetings::class);

        // Who may manage greetings (administrators hold every capability anyway).
        $cms->auth->roles->capability('hello.manage', 'Manage greetings', grantTo: ['admin']);

        // API: scopes for tokens, then the endpoints (they must live under /hello/).
        $cms->api->scope('hello:read', 'Read greetings');
        $cms->api->scope('hello:write', 'Send greetings');
        $cms->api->endpoint(Api\ListGreetings::class);
        $cms->api->endpoint(Api\CreateGreeting::class);

        // A field on the core users resource, shown as a column in People.
        $cms->api->extend('users')->field('hello_greetings', fn(array $row) => $greetings->countFor((string) ($row['username'] ?? '')), read: 'hello.manage');

        // Screens and extension points. Components live in resources/js/pages/admin/.
        $cms->admin->page('', '@hello/admin/Greetings', 'Greetings', 'hello.manage', ['label' => 'Greetings', 'icon' => 'smiley', 'group' => 'plugins']);
        $cms->admin->widget('dashboard', '@hello/admin/GreetingsWidget', title: 'Greetings', size: 'quarter', capability: 'hello.manage');
        $cms->admin->column('users.list', 'hello_greetings', label: 'Greeted', capability: 'hello.manage', align: 'end');
        $cms->admin->slot('users.edit.panels', '@hello/admin/SayHello', capability: 'hello.manage');

        // A settings tab rendered from the schema (Settings → Hello).
        $cms->admin->settings(
            'greeting',
            'Hello',
            Schema::object([
                'salutation' => Schema::string()->min(1)->max(30)->default('Hello')->description('The first word of every greeting.'),
                'punctuation' => Schema::enum(['!', '.', '…'])->default('!'),
                'shout' => Schema::bool()->default(false)->description('Greet in capital letters.'),
            ]),
            labels: ['salutation' => 'Salutation', 'punctuation' => 'Ends with', 'shout' => 'Shout'],
            description: 'How the hello plugin words its greetings, on the site and in the admin.',
            capability: 'hello.manage',
        );
    }

    public function activate(Cms $cms): void
    {
        (new Logger($cms->paths->logs()))->info('hello: activated');
    }
}
