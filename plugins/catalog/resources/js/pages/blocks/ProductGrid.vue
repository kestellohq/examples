<script setup>
import { KImage, Link } from '@kestello/app';

// catalog/product-grid: the server fills `items` (see CatalogProvider::site()),
// prices already formatted so the server render and the browser agree.
defineProps({
    items: { type: Array, default: () => [] },
    currency: { type: String, default: 'EUR' },
    price: { type: Boolean, default: true },
    empty: { type: String, default: '' },
    width: { type: String, default: 'wide' },
    category: { type: String, default: '' },
    sort: { type: String, default: 'newest' },
    limit: { type: Number, default: 8 },
    in_stock: Boolean,
});
</script>

<template>
    <div class="catalog-grid" :data-width="width">
        <ul v-if="items.length" class="catalog-grid__items">
            <li v-for="p in items" :key="p.id" class="catalog-card">
                <Link :href="p.url" class="catalog-card__link">
                    <div class="catalog-card__image">
                        <KImage v-if="p.image" :media="p.image" size="medium" sizes="(min-width: 74rem) 17rem, (min-width: 40rem) 45vw, 100vw" />
                    </div>
                    <span class="catalog-card__title">{{ p.title }}</span>
                </Link>
                <p v-if="p.brand" class="catalog-card__brand">{{ p.brand.title }}</p>
                <p class="catalog-card__meta">
                    <span v-if="price && p.price_label" class="catalog-card__price">{{ p.price_label }}</span>
                    <span v-if="!p.in_stock" class="catalog-card__sold">Sold out</span>
                </p>
            </li>
        </ul>
        <p v-else-if="empty" class="catalog-grid__empty">{{ empty }}</p>
    </div>
</template>

<style scoped>
.catalog-grid__items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: clamp(1.25rem, 3vw, 2rem);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
}
.catalog-card {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}
.catalog-card__link {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    color: inherit;
    text-decoration: none;
}
.catalog-card__image {
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: var(--block-radius, 6px);
    background: color-mix(in srgb, currentColor 6%, transparent);
}
.catalog-card__image :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.catalog-card__title {
    font-weight: 600;
    line-height: 1.3;
}
.catalog-card__link:hover .catalog-card__title,
.catalog-card__link:focus-visible .catalog-card__title {
    text-decoration: underline;
    text-underline-offset: 3px;
}
.catalog-card__brand {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.7;
}
.catalog-card__meta {
    margin: 0;
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
    flex-wrap: wrap;
}
.catalog-card__price {
    font-variant-numeric: tabular-nums;
}
.catalog-card__sold {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.7;
}
.catalog-grid__empty {
    opacity: 0.75;
    margin: 0;
}
</style>
