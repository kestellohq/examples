<script>
// Plugin pages wear the active theme's layout; themes can replace the whole
// page by shipping resources/js/pages/@hello/Greeting.vue.
export default { layout: 'Site' };
</script>

<script setup>
import { Head, usePage } from '@kestello/app';
import Wave from '../components/Wave.vue';

defineProps({ name: { type: String, required: true }, phrase: { type: String, default: '' }, greetings: { type: Number, default: 0 } });
const page = usePage();
</script>

<template>
    <Head :title="phrase || `Hello ${name}`" />
    <section class="hello-page">
        <h1>{{ phrase || `Hello, ${name}!` }}</h1>
        <p class="hello-page__note">Rendered by the <strong>hello</strong> plugin · {{ page.props.hello?.badge }}</p>
        <Wave :name="name" :greetings="greetings" />
    </section>
</template>

<style scoped>
/* The plugin styles its own markup. Colours come from the theme's block variables, so the page
   fits whichever theme is active. */
.hello-page {
    max-width: 68rem;
    margin: 0 auto;
    padding: 48px 24px;
}
.hello-page h1 {
    color: var(--block-accent, #2448c9);
}
.hello-page__note {
    opacity: 0.75;
}
</style>
