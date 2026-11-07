<script>
export default { layout: 'Site' };
</script>

<script setup>
import { Head } from '@kestello/app';

defineProps({ kestelloVersion: { type: String, default: '' } });
</script>

<template>
    <Head title="About" />
    <section class="container py-5">
        <h1>About (child theme)</h1>
        <p class="lead">
            This page comes from the <strong>base-child</strong> theme. Every other page and the layout are inherited from <strong>base</strong>.
        </p>
        <p class="text-secondary">Running Kestello {{ kestelloVersion }}.</p>
    </section>
</template>
