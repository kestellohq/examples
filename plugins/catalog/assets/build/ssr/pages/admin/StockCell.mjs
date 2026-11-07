import { t as _plugin_vue_export_helper_default } from "../../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { createTextVNode, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { useI18n } from "@kestello/sdk";
import { KBadge } from "@kestello/ui";
// plugins/catalog/resources/js/pages/admin/StockCell.vue
var _sfc_main = {
	__name: "StockCell",
	__ssrInlineRender: true,
	props: {
		row: {
			type: Object,
			default: null
		},
		value: {
			type: Object,
			default: null
		}
	},
	setup(__props) {
		const { __ } = useI18n("catalog");
		/** The Stock column on the products list. value = { quantity, low_at, low } from the entries resource. */
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.value) {
				_push(`<!--[-->`);
				if (__props.value.low) _push(ssrRenderComponent(unref(KBadge), { tone: __props.value.quantity === 0 ? "danger" : "warning" }, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(__props.value.quantity === 0 ? unref(__)("Sold out") : __props.value.quantity)}`);
						else return [createTextVNode(toDisplayString(__props.value.quantity === 0 ? unref(__)("Sold out") : __props.value.quantity), 1)];
					}),
					_: 1
				}, _parent));
				else _push(`<span class="catalog-cell" data-v-cbed6247>${ssrInterpolate(__props.value.quantity)}</span>`);
				_push(`<!--]-->`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/admin/StockCell.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var StockCell_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-cbed6247"]]);
export { StockCell_default as default };
