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
			_push(`<section class="container py-5"><h1>About (child theme)</h1><p class="lead"> This page comes from the <strong>base-child</strong> theme. Every other page and the layout are inherited from <strong>base</strong>. </p><p class="text-secondary">Running Kestello ${ssrInterpolate(__props.kestelloVersion)}.</p></section><!--]-->`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/About.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as default };
