import { t as _plugin_vue_export_helper_default } from "../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { unref, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { Head } from "@kestello/app";
// themes/base-child/resources/js/pages/About.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: "Site" }, {
	__name: "About",
	__ssrInlineRender: true,
	props: { kestelloVersion: {
		type: String,
		default: ""
	} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: "About" }, null, _parent));
			_push(`<section class="child-page page" data-v-59554f69><h1 data-v-59554f69>About (child theme)</h1><p class="lead" data-v-59554f69> This page comes from the <strong data-v-59554f69>base-child</strong> theme. Every other page and the layout are inherited from <strong data-v-59554f69>base</strong>. </p><p class="child-page__note" data-v-59554f69>Running Kestello ${ssrInterpolate(__props.kestelloVersion)}.</p></section><!--]-->`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/About.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var About_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-59554f69"]]);
export { About_default as default };
