<script setup>
import { ref } from 'vue';
import { Head, Link } from '@kestello/app';
import { ApiError, notify, useApi, useResource, useI18n } from '@kestello/sdk';
import { KButton, KCard, KField, KInput, KPageHeader, KTable, KTime } from '@kestello/ui';

// this plugin's own text (domain "hello"): translations in resources/lang/<locale>.po or .json
const { __ } = useI18n('hello');

defineOptions({ layout: 'Admin' });

/**
 * The hello plugin's admin page (/admin/p/hello). Everything comes from the
 * plugin's own endpoints, GET and POST /api/v1/hello/greetings.
 */
const api = useApi();
const greetings = useResource('/hello/greetings', { query: { limit: 25 } });
const name = ref('');
const error = ref('');
const sending = ref(false);

async function greet() {
    sending.value = true;
    error.value = '';
    try {
        const { data } = await api.post('/hello/greetings', { name: name.value.trim() });
        notify.success(data.phrase);
        name.value = '';
        await greetings.reload({ silent: true });
    } catch (e) {
        if (e instanceof ApiError && e.status === 422) error.value = e.fieldErrors().name ?? e.message;
        else notify.error(e);
    } finally {
        sending.value = false;
    }
}
</script>

<template>
    <Head :title="__('Greetings')" />
    <KPageHeader :title="__('Greetings')" :description="__('Everyone the hello plugin has greeted, newest first.')" />

    <div class="k-cells" style="--k-cols: 3">
        <KCard coord="A1" class="k-span-2" :title="__('Recent greetings')" flush>
            <KTable
                :columns="[
                    { key: 'phrase', label: __('Greeting') },
                    { key: 'created_at', label: __('When'), align: 'end' },
                ]"
                :rows="greetings.data.value ?? []"
                :loading="greetings.loading.value"
                :empty="__('Nobody has been greeted yet. Try the form, or visit /hello/your-name.')"
            >
                <template #cell-phrase="{ row }"
                    ><strong>{{ row.phrase }}</strong></template
                >
                <template #cell-created_at="{ row }"><KTime :value="row.created_at" /></template>
            </KTable>
        </KCard>

        <KCard coord="C1" :title="__('Greet someone')">
            <form class="k-form" @submit.prevent="greet">
                <KField
                    v-slot="{ id, describedBy, invalid }"
                    :label="__('Name')"
                    :help="__('Letters first, then letters, numbers, spaces or dashes.')"
                    :error="error"
                    required
                >
                    <KInput :id="id" v-model="name" maxlength="40" autocomplete="off" :invalid="invalid" :aria-describedby="describedBy" />
                </KField>
                <div>
                    <KButton type="submit" variant="primary" icon="smiley" :disabled="!name.trim()" :loading="sending">{{ __('Say hello') }}</KButton>
                </div>
            </form>
            <dl v-if="greetings.meta.value" class="k-facts">
                <div>
                    <dt>{{ __('Today') }}</dt>
                    <dd>{{ greetings.meta.value.today }}</dd>
                </div>
                <div>
                    <dt>{{ __('In total') }}</dt>
                    <dd>{{ greetings.meta.value.total }}</dd>
                </div>
            </dl>
            <p class="k-muted k-small">
                <Link href="/admin/settings?tab=hello.greeting" class="k-link">{{ __('Change the wording') }}</Link>
            </p>
        </KCard>
    </div>
</template>
