<script setup>
import { KBadge } from '@kestello/ui';
import { useI18n } from '@kestello/sdk';

// this plugin's own text (domain "catalog"): translations in resources/lang/<locale>.po or .json
const { __ } = useI18n('catalog');

/** The Stock column on the products list. value = { quantity, low_at, low } from the entries resource. */
defineProps({ row: { type: Object, default: null }, value: { type: Object, default: null } });
</script>

<template>
    <template v-if="value">
        <KBadge v-if="value.low" :tone="value.quantity === 0 ? 'danger' : 'warning'">{{ value.quantity === 0 ? __('Sold out') : value.quantity }}</KBadge>
        <span v-else class="catalog-cell">{{ value.quantity }}</span>
    </template>
</template>

<style scoped>
.catalog-cell {
    font-variant-numeric: tabular-nums;
}
</style>
