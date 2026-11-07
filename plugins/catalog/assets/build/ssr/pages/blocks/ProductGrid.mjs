import { t as _plugin_vue_export_helper_default } from "../../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { createBlock, createCommentVNode, createVNode, mergeProps, openBlock, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { KImage, Link } from "@kestello/app";
// plugins/catalog/resources/js/pages/blocks/ProductGrid.vue
var _sfc_main = {
	__name: "ProductGrid",
	__ssrInlineRender: true,
	props: {
		items: {
			type: Array,
			default: () => []
		},
		currency: {
			type: String,
			default: "EUR"
		},
		price: {
			type: Boolean,
			default: true
		},
		empty: {
			type: String,
			default: ""
		},
		width: {
			type: String,
			default: "wide"
		},
		category: {
			type: String,
			default: ""
		},
		sort: {
			type: String,
			default: "newest"
		},
		limit: {
			type: Number,
			default: 8
		},
		in_stock: Boolean
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "catalog-grid",
				"data-width": __props.width
			}, _attrs))} data-v-c8af1df9>`);
			if (__props.items.length) {
				_push(`<ul class="catalog-grid__items" data-v-c8af1df9><!--[-->`);
				ssrRenderList(__props.items, (p) => {
					_push(`<li class="catalog-card" data-v-c8af1df9>`);
					_push(ssrRenderComponent(unref(Link), {
						href: p.url,
						class: "catalog-card__link"
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) {
								_push(`<div class="catalog-card__image" data-v-c8af1df9${_scopeId}>`);
								if (p.image) _push(ssrRenderComponent(unref(KImage), {
									media: p.image,
									size: "medium",
									sizes: "(min-width: 74rem) 17rem, (min-width: 40rem) 45vw, 100vw"
								}, null, _parent, _scopeId));
								else _push(`<!---->`);
								_push(`</div><span class="catalog-card__title" data-v-c8af1df9${_scopeId}>${ssrInterpolate(p.title)}</span>`);
							} else return [createVNode("div", { class: "catalog-card__image" }, [p.image ? (openBlock(), createBlock(unref(KImage), {
								key: 0,
								media: p.image,
								size: "medium",
								sizes: "(min-width: 74rem) 17rem, (min-width: 40rem) 45vw, 100vw"
							}, null, 8, ["media"])) : createCommentVNode("v-if", true)]), createVNode("span", { class: "catalog-card__title" }, toDisplayString(p.title), 1)];
						}),
						_: 2
					}, _parent));
					if (p.brand) _push(`<p class="catalog-card__brand" data-v-c8af1df9>${ssrInterpolate(p.brand.title)}</p>`);
					else _push(`<!---->`);
					_push(`<p class="catalog-card__meta" data-v-c8af1df9>`);
					if (__props.price && p.price_label) _push(`<span class="catalog-card__price" data-v-c8af1df9>${ssrInterpolate(p.price_label)}</span>`);
					else _push(`<!---->`);
					if (!p.in_stock) _push(`<span class="catalog-card__sold" data-v-c8af1df9>Sold out</span>`);
					else _push(`<!---->`);
					_push(`</p></li>`);
				});
				_push(`<!--]--></ul>`);
			} else if (__props.empty) _push(`<p class="catalog-grid__empty" data-v-c8af1df9>${ssrInterpolate(__props.empty)}</p>`);
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/blocks/ProductGrid.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ProductGrid_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-c8af1df9"]]);
export { ProductGrid_default as default };
