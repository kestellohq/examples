<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { Head, Link, usePage } from '@kestello/app';
import { ApiError, notify, useApi, useCan, useResource, useI18n } from '@kestello/sdk';
import { KBadge, KButton, KCard, KField, KInput, KModal, KPageHeader, KSelect, KSwitch, KTable, KTime } from '@kestello/ui';

// this plugin's own text (domain "catalog"): translations in resources/lang/<locale>.po or .json
const { __ } = useI18n('catalog');

defineOptions({ layout: 'Admin' });

/**
 * Catalog → Stock (/admin/p/catalog/stock). Lowest stock first. Everything
 * here goes through the plugin's own endpoints under /api/v1/catalog.
 */
const page = usePage();
const api = useApi();
const can = useCan();
const canManage = computed(() => can('catalog.manage'));

const filters = reactive({ search: '', low: new URLSearchParams(page.url.split('?')[1] ?? '').get('low') === '1', page: 1 });
const query = computed(() => ({ search: filters.search.trim() || undefined, low: filters.low ? 1 : undefined, page: filters.page }));
const stock = useResource('/catalog/stock', { query });
let debounce = null;
watch(
    () => filters.search,
    () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            filters.page = 1;
        }, 250);
    },
);
watch(
    () => filters.low,
    () => {
        filters.page = 1;
    },
);

const meta = computed(() => stock.meta.value);
const reasons = computed(() => meta.value?.reasons ?? {});
const columns = computed(() => [
    { key: 'title', label: __('Product') },
    { key: 'sku', label: __('SKU') },
    { key: 'low_at', label: __('Low at'), align: 'end' },
    { key: 'quantity', label: __('In stock'), align: 'end' },
    { key: 'actions', label: '', align: 'end', width: '1%' },
]);

// ── one product: history, a movement, its low-stock level ──────────────
const open = ref(null); // the row
const detail = ref(null);
const form = reactive({ reason: 'received', amount: '', note: '' });
const lowAt = ref('');
const errors = ref({});
const saving = ref(false);

const SIGN = { received: 1, returned: 1, sold: -1, damaged: -1, counted: 0 };
const reasonOptions = computed(() => Object.entries(reasons.value).map(([value, label]) => ({ value, label: __(label) })));
const amountLabel = computed(() => (form.reason === 'counted' ? __('Quantity counted') : __('How many')));

async function show(row) {
    open.value = row;
    detail.value = null;
    errors.value = {};
    Object.assign(form, { reason: 'received', amount: '', note: '' });
    lowAt.value = row.custom_low_at ?? '';
    try {
        detail.value = (await api.get(`/catalog/products/${row.id}/stock`)).data;
    } catch (e) {
        notify.error(e);
    }
}

async function record() {
    const n = Number.parseInt(form.amount, 10);
    if (!Number.isFinite(n) || n < 0) {
        errors.value = { amount: __('Enter a whole number.') };
        return;
    }
    saving.value = true;
    errors.value = {};
    try {
        const sign = SIGN[form.reason];
        const { data } = await api.post(`/catalog/products/${open.value.id}/movements`, {
            reason: form.reason,
            amount: sign === 0 ? n : sign * n,
            note: form.note.trim() || undefined,
        });
        notify.success(__('{title}: {n} in stock', { title: open.value.title, n: data.quantity }));
        Object.assign(form, { amount: '', note: '' });
        await Promise.all([show(open.value), stock.reload({ silent: true })]);
    } catch (e) {
        if (e instanceof ApiError && e.status === 422) errors.value = { amount: e.fieldErrors().amount ?? e.message };
        else notify.error(e);
    } finally {
        saving.value = false;
    }
}

async function saveLowAt() {
    saving.value = true;
    try {
        const value = String(lowAt.value).trim() === '' ? null : Number.parseInt(lowAt.value, 10);
        await api.put(`/catalog/products/${open.value.id}/low-at`, { low_at: value });
        notify.success(__('Low-stock level saved'));
        await stock.reload({ silent: true });
    } catch (e) {
        notify.error(e);
    } finally {
        saving.value = false;
    }
}

const signed = (n) => (n > 0 ? `+${n}` : String(n));
</script>

<template>
    <Head :title="__('Stock')" />
    <KPageHeader :title="__('Stock')" :description="__('How many of each product you have, lowest first. A product is low at or below its level.')">
        <template #actions>
            <KButton href="/admin/content/catalog-product" icon="package">{{ __('Products') }}</KButton>
            <KButton v-if="canManage" href="/admin/settings?tab=catalog.general" icon="gear">{{ __('Settings') }}</KButton>
        </template>
    </KPageHeader>

    <div class="k-toolbar catalog-toolbar" role="search">
        <KField v-slot="{ id }" :label="__('Search products')" class="k-toolbar__grow">
            <KInput :id="id" v-model="filters.search" type="search" autocomplete="off" />
        </KField>
        <KSwitch v-model="filters.low" :label="__('Only products running low')" />
    </div>

    <KCard flush>
        <KTable
            :columns="columns"
            :rows="stock.data.value ?? []"
            :loading="stock.loading.value && !stock.data.value"
            :caption="__('Stock')"
            :empty="filters.low ? __('Nothing is running low.') : __('No products yet. Add one under Content → Products.')"
        >
            <template #cell-title="{ row }">
                <Link :href="`/admin/content/catalog-product/${row.id}`" class="k-link">{{ row.title || __('(no title)') }}</Link>
                <KBadge v-if="row.status !== 'published'" class="catalog-status">{{ row.status === 'draft' ? __('Draft') : row.status }}</KBadge>
            </template>
            <template #cell-sku="{ row }"
                ><code v-if="row.sku" class="k-code">{{ row.sku }}</code></template
            >
            <template #cell-low_at="{ row }"
                ><span :class="{ 'k-muted': row.custom_low_at === null }">{{ row.low_at }}</span></template
            >
            <template #cell-quantity="{ row }">
                <KBadge v-if="row.low" :tone="row.quantity === 0 ? 'danger' : 'warning'">{{ row.quantity === 0 ? __('Sold out') : row.quantity }}</KBadge>
                <strong v-else class="catalog-qty">{{ row.quantity }}</strong>
            </template>
            <template #cell-actions="{ row }">
                <KButton size="sm" :icon="canManage ? 'plus-minus' : 'clock-counter-clockwise'" @click="show(row)">{{
                    canManage ? __('Change') : __('History')
                }}</KButton>
            </template>
        </KTable>

        <template v-if="meta && meta.last_page > 1" #footer>
            <div class="k-pager">
                <span class="k-muted">{{ __('Page {page} of {last} · {total} total', { page: meta.page, last: meta.last_page, total: meta.total }) }}</span>
                <KButton size="sm" icon="caret-left" :disabled="meta.page <= 1" @click="filters.page--">{{ __('Previous') }}</KButton>
                <KButton size="sm" :disabled="meta.page >= meta.last_page" @click="filters.page++">{{ __('Next') }}</KButton>
            </div>
        </template>
    </KCard>

    <KModal :open="!!open" :title="open?.title ?? ''" size="lg" @close="open = null">
        <div v-if="open" class="catalog-detail">
            <dl class="k-facts">
                <div>
                    <dt>{{ __('In stock') }}</dt>
                    <dd>{{ detail?.quantity ?? open.quantity }}</dd>
                </div>
                <div>
                    <dt>{{ __('Low at') }}</dt>
                    <dd>{{ detail?.low_at ?? open.low_at }}</dd>
                </div>
                <div v-if="open.sku">
                    <dt>{{ __('SKU') }}</dt>
                    <dd>
                        <code class="k-code">{{ open.sku }}</code>
                    </dd>
                </div>
            </dl>

            <form v-if="canManage" class="catalog-move" @submit.prevent="record">
                <KField v-slot="{ id }" :label="__('What happened')">
                    <KSelect :id="id" v-model="form.reason" :options="reasonOptions" />
                </KField>
                <KField v-slot="{ id, describedBy, invalid }" :label="amountLabel" :error="errors.amount" required>
                    <KInput
                        :id="id"
                        v-model="form.amount"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        :invalid="invalid"
                        :aria-describedby="describedBy"
                    />
                </KField>
                <KField v-slot="{ id }" :label="__('Note')" class="catalog-move__note">
                    <KInput :id="id" v-model="form.note" maxlength="200" :placeholder="__('Order number, supplier…')" />
                </KField>
                <div class="catalog-move__submit">
                    <KButton type="submit" variant="primary" :loading="saving">{{ __('Record') }}</KButton>
                </div>
            </form>

            <h3 class="k-h3">{{ __('History') }}</h3>
            <KTable
                :columns="[
                    { key: 'created_at', label: __('When') },
                    { key: 'reason', label: __('What') },
                    { key: 'change', label: __('Change'), align: 'end' },
                    { key: 'quantity_after', label: __('After'), align: 'end' },
                ]"
                :rows="detail?.movements ?? []"
                :loading="!detail"
                :empty="__('No movements yet.')"
            >
                <template #cell-created_at="{ row }"
                    ><KTime :value="row.created_at" />
                    <div v-if="row.user" class="k-muted k-small">{{ row.user }}</div></template
                >
                <template #cell-reason="{ row }"
                    >{{ __(reasons[row.reason] ?? row.reason) }}
                    <div v-if="row.note" class="k-muted k-small">{{ row.note }}</div></template
                >
                <template #cell-change="{ row }"
                    ><span class="catalog-qty" :class="row.change < 0 ? 'is-out' : 'is-in'">{{ signed(row.change) }}</span></template
                >
            </KTable>

            <form v-if="canManage" class="catalog-low" @submit.prevent="saveLowAt">
                <KField
                    v-slot="{ id, describedBy }"
                    :label="__('Low-stock level for this product')"
                    :help="__('Leave empty to use the site-wide level ({n}).', { n: meta?.default_low_at ?? 5 })"
                >
                    <KInput :id="id" v-model="lowAt" type="number" min="0" step="1" inputmode="numeric" :aria-describedby="describedBy" />
                </KField>
                <KButton type="submit" :loading="saving">{{ __('Save level') }}</KButton>
            </form>
        </div>
    </KModal>
</template>

<style scoped>
.catalog-toolbar > .k-switch {
    min-height: 36px;
}
.catalog-status {
    margin-left: 8px;
}
.catalog-qty {
    font-variant-numeric: tabular-nums;
}
.catalog-qty.is-in {
    color: var(--k-success);
}
.catalog-qty.is-out {
    color: var(--k-danger);
}
.catalog-detail {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.catalog-move {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 12px 16px;
    align-items: end;
    padding: 16px;
    border: 1px solid var(--k-rule);
}
.catalog-move__note {
    grid-column: 1 / -1;
}
.catalog-move__submit {
    grid-column: 1 / -1;
}
.catalog-low {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    padding-top: 16px;
    border-top: 1px dashed var(--k-rule);
}
.catalog-low > .k-field {
    flex: 1;
}
@media (max-width: 560px) {
    .catalog-move {
        grid-template-columns: 1fr;
    }
    .catalog-low {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
