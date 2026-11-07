<script setup>
import { Link } from '@kestello/app';
import { useResource, useI18n } from '@kestello/sdk';
import { KBadge } from '@kestello/ui';

// this plugin's own text (domain "catalog"): translations in resources/lang/<locale>.po or .json
const { __ } = useI18n('catalog');

/** Dashboard widget: the five lowest products that are running low. */
defineProps({ context: { type: Object, default: () => ({}) } });
const low = useResource('/catalog/stock', { query: { low: 1, per_page: 5 } });
</script>

<template>
    <div v-if="low.data.value" class="catalog-widget">
        <p v-if="!low.data.value.length" class="k-muted k-small">{{ __('Nothing is running low.') }}</p>
        <ul v-else class="k-list">
            <li v-for="p in low.data.value" :key="p.id" class="k-list__item">
                <div class="k-list__main">
                    <Link :href="`/admin/content/catalog-product/${p.id}`" class="k-link">{{ p.title }}</Link>
                </div>
                <KBadge :tone="p.quantity === 0 ? 'danger' : 'warning'">{{ p.quantity === 0 ? __('Sold out') : __('{n} left', { n: p.quantity }) }}</KBadge>
            </li>
        </ul>
        <Link href="/admin/p/catalog/stock?low=1" class="k-link k-small">
            {{ low.meta.value?.total > 5 ? __('All {n} running low', { n: low.meta.value.total }) : __('Open stock') }}
        </Link>
    </div>
    <p v-else-if="low.error.value" class="k-muted k-small">{{ low.error.value.message }}</p>
    <p v-else class="k-muted k-small">{{ __('Counting…') }}</p>
</template>

<style scoped>
.catalog-widget {
    display: grid;
    gap: 10px;
}
.catalog-widget .k-list__item {
    align-items: center;
}
</style>
