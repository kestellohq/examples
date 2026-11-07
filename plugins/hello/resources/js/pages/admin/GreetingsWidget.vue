<script setup>
import { Link } from '@kestello/app';
import { useResource, useI18n } from '@kestello/sdk';

import { KTime } from '@kestello/ui';

// this plugin's own text (domain "hello"): translations in resources/lang/<locale>.po or .json
const { __ } = useI18n('hello');

/** Dashboard widget: the core wraps it in a titled cell; this is the body. */
defineProps({ context: { type: Object, default: () => ({}) } });
const greetings = useResource('/hello/greetings', { query: { limit: 1 } });
</script>

<template>
    <div v-if="greetings.meta.value" class="hello-widget">
        <p class="hello-widget__count">{{ __('{n} today', { n: greetings.meta.value.today }) }}</p>
        <p class="k-muted k-small">{{ __('{n} in total', { n: greetings.meta.value.total }) }}</p>
        <p v-if="greetings.data.value?.[0]" class="k-small">
            {{ __('Latest:') }} <strong>{{ greetings.data.value[0].name }}</strong
            >, <KTime :value="greetings.data.value[0].created_at" />
        </p>
        <Link href="/admin/p/hello" class="k-link k-small">{{ __('Open greetings') }}</Link>
    </div>
    <p v-else-if="greetings.error.value" class="k-muted k-small">{{ greetings.error.value.message }}</p>
    <p v-else class="k-muted k-small">{{ __('Counting…') }}</p>
</template>

<style scoped>
.hello-widget {
    display: grid;
    gap: 4px;
}
.hello-widget p {
    margin: 0;
}
.hello-widget__count {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
}
</style>
