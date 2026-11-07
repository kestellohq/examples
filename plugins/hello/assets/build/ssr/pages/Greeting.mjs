import { t as _plugin_vue_export_helper_default } from "../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { computed, mergeProps, ref, unref, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
import { Head, usePage } from "@kestello/app";
// plugins/hello/resources/js/components/Wave.vue
var _sfc_main$1 = {
	__name: "Wave",
	__ssrInlineRender: true,
	props: {
		name: {
			type: String,
			required: true
		},
		greetings: {
			type: Number,
			default: 0
		},
		variant: {
			type: String,
			default: "primary"
		}
	},
	setup(__props) {
		const page = usePage();
		const user = computed(() => page.props.auth?.user ?? null);
		const waves = ref(0);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "hello-wave d-flex align-items-center gap-3" }, _attrs))}><button type="button" class="${ssrRenderClass([__props.variant === "outline" ? "btn-outline-primary" : "btn-primary", "btn"])}">👋 Wave at ${ssrInterpolate(__props.name)}</button><span class="text-secondary">`);
			if (waves.value === 0) {
				_push(`<!--[-->${ssrInterpolate(__props.greetings)} greetings on ${ssrInterpolate(unref(page).props.site.name)}`);
				if (user.value) _push(`<!--[-->, signed in as ${ssrInterpolate(user.value.username)}<!--]-->`);
				else _push(`<!---->`);
				_push(`<!--]-->`);
			} else _push(`<!--[-->You waved ${ssrInterpolate(waves.value)} time${ssrInterpolate(waves.value === 1 ? "" : "s")}<!--]-->`);
			_push(`</span></div>`);
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/Wave.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
// plugins/hello/resources/js/pages/Greeting.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: "Site" }, {
	__name: "Greeting",
	__ssrInlineRender: true,
	props: {
		name: {
			type: String,
			required: true
		},
		phrase: {
			type: String,
			default: ""
		},
		greetings: {
			type: Number,
			default: 0
		}
	},
	setup(__props) {
		const page = usePage();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: __props.phrase || `Hello ${__props.name}` }, null, _parent));
			_push(`<section class="container py-5 hello-plugin" data-v-a21fa186><h1 data-v-a21fa186>${ssrInterpolate(__props.phrase || `Hello, ${__props.name}!`)}</h1><p class="text-secondary" data-v-a21fa186>Rendered by the <strong data-v-a21fa186>hello</strong> plugin · ${ssrInterpolate(unref(page).props.hello?.badge)}</p>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				name: __props.name,
				greetings: __props.greetings
			}, null, _parent));
			_push(`</section><!--]-->`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Greeting.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Greeting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-a21fa186"]]);
export { Greeting_default as default };
