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
    <div class="hello-wave d-flex align-items-center gap-3">
        <button type="button" class="btn" :class="variant === 'outline' ? 'btn-outline-primary' : 'btn-primary'" @click="waves++">👋 Wave at {{ name }}</button>
        <span class="text-secondary">
            <template v-if="waves === 0"
                >{{ greetings }} greetings on {{ page.props.site.name }}<template v-if="user">, signed in as {{ user.username }}</template></template
            >
            <template v-else>You waved {{ waves }} time{{ waves === 1 ? '' : 's' }}</template>
        </span>
    </div>
</template>
