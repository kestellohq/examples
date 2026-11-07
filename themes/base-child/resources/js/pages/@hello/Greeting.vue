<script>
// Overrides the hello plugin's "@hello/Greeting" page without touching the plugin.
export default { layout: 'Site' };
</script>

<script setup>
import { Head, usePage } from '@kestello/app';

defineProps({ name: { type: String, required: true } });
const page = usePage();
</script>

<template>
    <Head :title="`Hello ${name}`" />
    <section class="child-page page">
        <h1>{{ name }}, greetings from the child theme</h1>
        <p class="child-page__note">This page overrides the hello plugin's page without touching the plugin · {{ page.props.hello?.badge }}</p>
    </section>
</template>

<style scoped>
.child-page {
    max-width: 68rem;
    margin: 0 auto;
    padding: 48px 24px;
}
.child-page__note {
    color: var(--wall-ink-2);
}
</style>
