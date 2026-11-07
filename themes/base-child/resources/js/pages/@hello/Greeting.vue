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
    <section class="container py-5">
        <h1>👋 {{ name }}, greetings from the child theme</h1>
        <p class="text-secondary">This page overrides the hello plugin's page without touching the plugin · {{ page.props.hello?.badge }}</p>
    </section>
</template>
