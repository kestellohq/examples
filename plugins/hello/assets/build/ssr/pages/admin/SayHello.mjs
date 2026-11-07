import { computed, createTextVNode, createVNode, mergeProps, ref, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { notify, useApi, useI18n } from "@kestello/sdk";
import { KButton, KCard } from "@kestello/ui";
// plugins/hello/resources/js/pages/admin/SayHello.vue
var _sfc_main = {
	__name: "SayHello",
	__ssrInlineRender: true,
	props: { context: {
		type: Object,
		required: true
	} },
	setup(__props) {
		const { __ } = useI18n("hello");
		/**
		* Person screen panel (slot "users.edit.panels"). context.user is the
		* person shown; hello_greetings is the field this plugin adds to the
		* users resource.
		*/
		const props = __props;
		const api = useApi();
		const count = ref(props.context.user?.hello_greetings ?? 0);
		const sending = ref(false);
		watch(() => props.context.user?.hello_greetings, (n) => {
			count.value = n ?? 0;
		});
		async function greet() {
			sending.value = true;
			try {
				const { data } = await api.post("/hello/greetings", { name: props.context.user.username });
				count.value = data.count;
				notify.success(data.phrase);
			} catch (e) {
				notify.error(e);
			} finally {
				sending.value = false;
			}
		}
		const greeted = computed(() => count.value === 0 ? __("{name} has not been greeted yet.", { name: props.context.user.username }) : __("{name} has been greeted {n, plural, one {# time} other {# times}}.", {
			name: props.context.user.username,
			n: count.value
		}));
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(KCard), mergeProps({
				title: unref(__)("Greetings"),
				description: unref(__)("From the hello plugin.")
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p${_scopeId}>${ssrInterpolate(greeted.value)}</p><div${_scopeId}>`);
						_push(ssrRenderComponent(unref(KButton), {
							icon: "smiley",
							loading: sending.value,
							disabled: !/^[A-Za-z]/.test(__props.context.user.username ?? ""),
							onClick: greet
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(unref(__)("Say hello"))}`);
								else return [createTextVNode(toDisplayString(unref(__)("Say hello")), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("p", null, toDisplayString(greeted.value), 1), createVNode("div", null, [createVNode(unref(KButton), {
						icon: "smiley",
						loading: sending.value,
						disabled: !/^[A-Za-z]/.test(__props.context.user.username ?? ""),
						onClick: greet
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Say hello")), 1)]),
						_: 1
					}, 8, ["loading", "disabled"])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/admin/SayHello.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as default };
