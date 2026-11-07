<script setup>
import { computed, ref, watch } from 'vue';
import { notify, useApi, useI18n } from '@kestello/sdk';
import { KButton, KCard } from '@kestello/ui';

// this plugin's own text (domain "hello"): translations in resources/lang/<locale>.po or .json
const { __ } = useI18n('hello');

/**
 * Person screen panel (slot "users.edit.panels"). context.user is the
 * person shown; hello_greetings is the field this plugin adds to the
 * users resource.
 */
const props = defineProps({ context: { type: Object, required: true } });
const api = useApi();
const count = ref(props.context.user?.hello_greetings ?? 0);
const sending = ref(false);
watch(
    () => props.context.user?.hello_greetings,
    (n) => {
        count.value = n ?? 0;
    },
);

async function greet() {
    sending.value = true;
    try {
        const { data } = await api.post('/hello/greetings', { name: props.context.user.username });
        count.value = data.count;
        notify.success(data.phrase);
    } catch (e) {
        notify.error(e);
    } finally {
        sending.value = false;
    }
}

// in the script, not the template: an ICU message's "}}" would end a {{ }} interpolation
const greeted = computed(() =>
    count.value === 0
        ? __('{name} has not been greeted yet.', { name: props.context.user.username })
        : __('{name} has been greeted {n, plural, one {# time} other {# times}}.', { name: props.context.user.username, n: count.value }),
);
</script>

<template>
    <KCard :title="__('Greetings')" :description="__('From the hello plugin.')">
        <p>{{ greeted }}</p>
        <div>
            <KButton icon="smiley" :loading="sending" :disabled="!/^[A-Za-z]/.test(context.user.username ?? '')" @click="greet">{{ __('Say hello') }}</KButton>
        </div>
    </KCard>
</template>
