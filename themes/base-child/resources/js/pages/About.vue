<script>
export default { layout: 'Site' };
</script>

<script setup>
import { Head } from '@kestello/app';

defineProps({ kestelloVersion: { type: String, default: '' } });
</script>

<template>
    <Head title="About" />
    <section class="child-page page">
        <h1>About (child theme)</h1>
        <p class="lead">
            This page comes from the <strong>base-child</strong> theme. Every other page and the layout are inherited from <strong>base</strong>.
        </p>
        <p class="child-page__note">Running Kestello {{ kestelloVersion }}.</p>
    </section>
</template>

<style scoped>
/* .page and .lead come from the base theme; the rest is this theme's own. */
.child-page {
    max-width: 68rem;
    margin: 0 auto;
    padding: 48px 24px;
}
.child-page__note {
    color: var(--wall-ink-2);
}
</style>
