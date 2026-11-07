import { t as _plugin_vue_export_helper_default } from "../../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { createTextVNode, mergeProps, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { Link } from "@kestello/app";
import { useI18n, useResource } from "@kestello/sdk";
import { KBadge } from "@kestello/ui";
// plugins/catalog/resources/js/pages/admin/LowStockWidget.vue
var _sfc_main = {
	__name: "LowStockWidget",
	__ssrInlineRender: true,
	props: { context: {
		type: Object,
		default: () => ({})
	} },
	setup(__props) {
		const { __ } = useI18n("catalog");
		/** Dashboard widget: the five lowest products that are running low. */
		const low = useResource("/catalog/stock", { query: {
			low: 1,
			per_page: 5
		} });
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(low).data.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "catalog-widget" }, _attrs))} data-v-c486f60b>`);
				if (!unref(low).data.value.length) _push(`<p class="k-muted k-small" data-v-c486f60b>${ssrInterpolate(unref(__)("Nothing is running low."))}</p>`);
				else {
					_push(`<ul class="k-list" data-v-c486f60b><!--[-->`);
					ssrRenderList(unref(low).data.value, (p) => {
						_push(`<li class="k-list__item" data-v-c486f60b><div class="k-list__main" data-v-c486f60b>`);
						_push(ssrRenderComponent(unref(Link), {
							href: `/admin/content/catalog-product/${p.id}`,
							class: "k-link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(p.title)}`);
								else return [createTextVNode(toDisplayString(p.title), 1)];
							}),
							_: 2
						}, _parent));
						_push(`</div>`);
						_push(ssrRenderComponent(unref(KBadge), { tone: p.quantity === 0 ? "danger" : "warning" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(p.quantity === 0 ? unref(__)("Sold out") : unref(__)("{n} left", { n: p.quantity }))}`);
								else return [createTextVNode(toDisplayString(p.quantity === 0 ? unref(__)("Sold out") : unref(__)("{n} left", { n: p.quantity })), 1)];
							}),
							_: 2
						}, _parent));
						_push(`</li>`);
					});
					_push(`<!--]--></ul>`);
				}
				_push(ssrRenderComponent(unref(Link), {
					href: "/admin/p/catalog/stock?low=1",
					class: "k-link k-small"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(unref(low).meta.value?.total > 5 ? unref(__)("All {n} running low", { n: unref(low).meta.value.total }) : unref(__)("Open stock"))}`);
						else return [createTextVNode(toDisplayString(unref(low).meta.value?.total > 5 ? unref(__)("All {n} running low", { n: unref(low).meta.value.total }) : unref(__)("Open stock")), 1)];
					}),
					_: 1
				}, _parent));
				_push(`</div>`);
			} else if (unref(low).error.value) _push(`<p${ssrRenderAttrs(mergeProps({ class: "k-muted k-small" }, _attrs))} data-v-c486f60b>${ssrInterpolate(unref(low).error.value.message)}</p>`);
			else _push(`<p${ssrRenderAttrs(mergeProps({ class: "k-muted k-small" }, _attrs))} data-v-c486f60b>${ssrInterpolate(unref(__)("Counting…"))}</p>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/admin/LowStockWidget.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var LowStockWidget_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-c486f60b"]]);
export { LowStockWidget_default as default };
