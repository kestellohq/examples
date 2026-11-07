import { t as _plugin_vue_export_helper_default } from "../../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { createTextVNode, mergeProps, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { Link } from "@kestello/app";
import { useI18n, useResource } from "@kestello/sdk";
import { KTime } from "@kestello/ui";
// plugins/hello/resources/js/pages/admin/GreetingsWidget.vue
var _sfc_main = {
	__name: "GreetingsWidget",
	__ssrInlineRender: true,
	props: { context: {
		type: Object,
		default: () => ({})
	} },
	setup(__props) {
		const { __ } = useI18n("hello");
		/** Dashboard widget: the core wraps it in a titled cell; this is the body. */
		const greetings = useResource("/hello/greetings", { query: { limit: 1 } });
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(greetings).meta.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "hello-widget" }, _attrs))} data-v-931fae9c><p class="hello-widget__count" data-v-931fae9c>${ssrInterpolate(unref(__)("{n} today", { n: unref(greetings).meta.value.today }))}</p><p class="k-muted k-small" data-v-931fae9c>${ssrInterpolate(unref(__)("{n} in total", { n: unref(greetings).meta.value.total }))}</p>`);
				if (unref(greetings).data.value?.[0]) {
					_push(`<p class="k-small" data-v-931fae9c>${ssrInterpolate(unref(__)("Latest:"))} <strong data-v-931fae9c>${ssrInterpolate(unref(greetings).data.value[0].name)}</strong>, `);
					_push(ssrRenderComponent(unref(KTime), { value: unref(greetings).data.value[0].created_at }, null, _parent));
					_push(`</p>`);
				} else _push(`<!---->`);
				_push(ssrRenderComponent(unref(Link), {
					href: "/admin/p/hello",
					class: "k-link k-small"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(unref(__)("Open greetings"))}`);
						else return [createTextVNode(toDisplayString(unref(__)("Open greetings")), 1)];
					}),
					_: 1
				}, _parent));
				_push(`</div>`);
			} else if (unref(greetings).error.value) _push(`<p${ssrRenderAttrs(mergeProps({ class: "k-muted k-small" }, _attrs))} data-v-931fae9c>${ssrInterpolate(unref(greetings).error.value.message)}</p>`);
			else _push(`<p${ssrRenderAttrs(mergeProps({ class: "k-muted k-small" }, _attrs))} data-v-931fae9c>${ssrInterpolate(unref(__)("Counting…"))}</p>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/admin/GreetingsWidget.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var GreetingsWidget_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-931fae9c"]]);
export { GreetingsWidget_default as default };
