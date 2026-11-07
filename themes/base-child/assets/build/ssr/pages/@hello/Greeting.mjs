import { t as _plugin_vue_export_helper_default } from "../../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { unref, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { Head, usePage } from "@kestello/app";
// themes/base-child/resources/js/pages/@hello/Greeting.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: "Site" }, {
	__name: "Greeting",
	__ssrInlineRender: true,
	props: { name: {
		type: String,
		required: true
	} },
	setup(__props) {
		const page = usePage();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: `Hello ${__props.name}` }, null, _parent));
			_push(`<section class="child-page page" data-v-2ec31416><h1 data-v-2ec31416>${ssrInterpolate(__props.name)}, greetings from the child theme</h1><p class="child-page__note" data-v-2ec31416>This page overrides the hello plugin&#39;s page without touching the plugin · ${ssrInterpolate(unref(page).props.hello?.badge)}</p></section><!--]-->`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/@hello/Greeting.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Greeting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-2ec31416"]]);
export { Greeting_default as default };
