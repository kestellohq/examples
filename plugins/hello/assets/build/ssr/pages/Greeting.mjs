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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "hello-wave" }, _attrs))} data-v-fcabcb24><button type="button" class="${ssrRenderClass([{ "hello-wave__button--outline": __props.variant === "outline" }, "hello-wave__button"])}" data-v-fcabcb24> Wave at ${ssrInterpolate(__props.name)}</button><span class="hello-wave__count" data-v-fcabcb24>`);
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
var Wave_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$1, [["__scopeId", "data-v-fcabcb24"]]);
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
			_push(`<section class="hello-page" data-v-4ea53134><h1 data-v-4ea53134>${ssrInterpolate(__props.phrase || `Hello, ${__props.name}!`)}</h1><p class="hello-page__note" data-v-4ea53134>Rendered by the <strong data-v-4ea53134>hello</strong> plugin · ${ssrInterpolate(unref(page).props.hello?.badge)}</p>`);
			_push(ssrRenderComponent(Wave_default, {
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
var Greeting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-4ea53134"]]);
export { Greeting_default as default };
