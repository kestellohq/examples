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
    <section class="container py-5 hello-plugin">
        <h1>{{ phrase || `Hello, ${name}!` }}</h1>
        <p class="text-secondary">Rendered by the <strong>hello</strong> plugin · {{ page.props.hello?.badge }}</p>
        <Wave :name="name" :greetings="greetings" />
    </section>
</template>

<style scoped>
.hello-plugin h1 {
    color: #7c3aed;
}
</style>
