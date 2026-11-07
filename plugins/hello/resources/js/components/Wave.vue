<script setup>
import { computed, ref } from 'vue';
import { usePage } from '@kestello/app';

defineProps({
    name: { type: String, required: true },
    greetings: { type: Number, default: 0 },
    variant: { type: String, default: 'primary' },
});

const page = usePage();
const user = computed(() => page.props.auth?.user ?? null);
const waves = ref(0);
</script>

<template>
    <div class="hello-wave">
        <button type="button" class="hello-wave__button" :class="{ 'hello-wave__button--outline': variant === 'outline' }" @click="waves++">
            Wave at {{ name }}
        </button>
        <span class="hello-wave__count">
            <template v-if="waves === 0"
                >{{ greetings }} greetings on {{ page.props.site.name }}<template v-if="user">, signed in as {{ user.username }}</template></template
            >
            <template v-else>You waved {{ waves }} time{{ waves === 1 ? '' : 's' }}</template>
        </span>
    </div>
</template>

<style scoped>
/* Colours from the theme's block variables, as the core Button block uses them. */
.hello-wave {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
}
.hello-wave__button {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    padding: 0.6rem 1.35rem;
    border-radius: var(--block-button-radius, 999px);
    border: 2px solid var(--block-accent, #2448c9);
    background: var(--block-accent, #2448c9);
    color: var(--block-accent-ink, #fff);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
}
.hello-wave__button:hover {
    background: var(--block-accent-deep, #1a379e);
    border-color: var(--block-accent-deep, #1a379e);
}
.hello-wave__button--outline {
    background: none;
    color: var(--block-accent, #2448c9);
}
.hello-wave__button--outline:hover {
    background: var(--block-accent, #2448c9);
    color: var(--block-accent-ink, #fff);
}
.hello-wave__button:focus-visible {
    outline: 3px solid var(--block-accent, #2448c9);
    outline-offset: 3px;
}
.hello-wave__count {
    opacity: 0.75;
}
</style>
