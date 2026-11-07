import { createBlock, createCommentVNode, createTextVNode, createVNode, openBlock, ref, toDisplayString, unref, useSSRContext, withCtx, withModifiers } from "vue";
import { ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { Head, Link } from "@kestello/app";
import { ApiError, notify, useApi, useI18n, useResource } from "@kestello/sdk";
import { KButton, KCard, KField, KInput, KPageHeader, KTable, KTime } from "@kestello/ui";
// plugins/hello/resources/js/pages/admin/Greetings.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: "Admin" }, {
	__name: "Greetings",
	__ssrInlineRender: true,
	setup(__props) {
		const { __ } = useI18n("hello");
		/**
		* The hello plugin's admin page (/admin/p/hello). Everything comes from the
		* plugin's own endpoints, GET and POST /api/v1/hello/greetings.
		*/
		const api = useApi();
		const greetings = useResource("/hello/greetings", { query: { limit: 25 } });
		const name = ref("");
		const error = ref("");
		const sending = ref(false);
		async function greet() {
			sending.value = true;
			error.value = "";
			try {
				const { data } = await api.post("/hello/greetings", { name: name.value.trim() });
				notify.success(data.phrase);
				name.value = "";
				await greetings.reload({ silent: true });
			} catch (e) {
				if (e instanceof ApiError && e.status === 422) error.value = e.fieldErrors().name ?? e.message;
				else notify.error(e);
			} finally {
				sending.value = false;
			}
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: unref(__)("Greetings") }, null, _parent));
			_push(ssrRenderComponent(unref(KPageHeader), {
				title: unref(__)("Greetings"),
				description: unref(__)("Everyone the hello plugin has greeted, newest first.")
			}, null, _parent));
			_push(`<div class="k-cells" style="--k-cols:3;">`);
			_push(ssrRenderComponent(unref(KCard), {
				coord: "A1",
				class: "k-span-2",
				title: unref(__)("Recent greetings"),
				flush: ""
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(unref(KTable), {
						columns: [{
							key: "phrase",
							label: unref(__)("Greeting")
						}, {
							key: "created_at",
							label: unref(__)("When"),
							align: "end"
						}],
						rows: unref(greetings).data.value ?? [],
						loading: unref(greetings).loading.value,
						empty: unref(__)("Nobody has been greeted yet. Try the form, or visit /hello/your-name.")
					}, {
						"cell-phrase": withCtx(({ row }, _push, _parent, _scopeId) => {
							if (_push) _push(`<strong${_scopeId}>${ssrInterpolate(row.phrase)}</strong>`);
							else return [createVNode("strong", null, toDisplayString(row.phrase), 1)];
						}),
						"cell-created_at": withCtx(({ row }, _push, _parent, _scopeId) => {
							if (_push) _push(ssrRenderComponent(unref(KTime), { value: row.created_at }, null, _parent, _scopeId));
							else return [createVNode(unref(KTime), { value: row.created_at }, null, 8, ["value"])];
						}),
						_: 1
					}, _parent, _scopeId));
					else return [createVNode(unref(KTable), {
						columns: [{
							key: "phrase",
							label: unref(__)("Greeting")
						}, {
							key: "created_at",
							label: unref(__)("When"),
							align: "end"
						}],
						rows: unref(greetings).data.value ?? [],
						loading: unref(greetings).loading.value,
						empty: unref(__)("Nobody has been greeted yet. Try the form, or visit /hello/your-name.")
					}, {
						"cell-phrase": withCtx(({ row }) => [createVNode("strong", null, toDisplayString(row.phrase), 1)]),
						"cell-created_at": withCtx(({ row }) => [createVNode(unref(KTime), { value: row.created_at }, null, 8, ["value"])]),
						_: 1
					}, 8, [
						"columns",
						"rows",
						"loading",
						"empty"
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(unref(KCard), {
				coord: "C1",
				title: unref(__)("Greet someone")
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<form class="k-form"${_scopeId}>`);
						_push(ssrRenderComponent(unref(KField), {
							label: unref(__)("Name"),
							help: unref(__)("Letters first, then letters, numbers, spaces or dashes."),
							error: error.value,
							required: ""
						}, {
							default: withCtx(({ id, describedBy, invalid }, _push, _parent, _scopeId) => {
								if (_push) _push(ssrRenderComponent(unref(KInput), {
									id,
									modelValue: name.value,
									"onUpdate:modelValue": ($event) => name.value = $event,
									maxlength: "40",
									autocomplete: "off",
									invalid,
									"aria-describedby": describedBy
								}, null, _parent, _scopeId));
								else return [createVNode(unref(KInput), {
									id,
									modelValue: name.value,
									"onUpdate:modelValue": ($event) => name.value = $event,
									maxlength: "40",
									autocomplete: "off",
									invalid,
									"aria-describedby": describedBy
								}, null, 8, [
									"id",
									"modelValue",
									"onUpdate:modelValue",
									"invalid",
									"aria-describedby"
								])];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<div${_scopeId}>`);
						_push(ssrRenderComponent(unref(KButton), {
							type: "submit",
							variant: "primary",
							icon: "smiley",
							disabled: !name.value.trim(),
							loading: sending.value
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(unref(__)("Say hello"))}`);
								else return [createTextVNode(toDisplayString(unref(__)("Say hello")), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div></form>`);
						if (unref(greetings).meta.value) _push(`<dl class="k-facts"${_scopeId}><div${_scopeId}><dt${_scopeId}>${ssrInterpolate(unref(__)("Today"))}</dt><dd${_scopeId}>${ssrInterpolate(unref(greetings).meta.value.today)}</dd></div><div${_scopeId}><dt${_scopeId}>${ssrInterpolate(unref(__)("In total"))}</dt><dd${_scopeId}>${ssrInterpolate(unref(greetings).meta.value.total)}</dd></div></dl>`);
						else _push(`<!---->`);
						_push(`<p class="k-muted k-small"${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/settings?tab=hello.greeting",
							class: "k-link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(unref(__)("Change the wording"))}`);
								else return [createTextVNode(toDisplayString(unref(__)("Change the wording")), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</p>`);
					} else return [
						createVNode("form", {
							class: "k-form",
							onSubmit: withModifiers(greet, ["prevent"])
						}, [createVNode(unref(KField), {
							label: unref(__)("Name"),
							help: unref(__)("Letters first, then letters, numbers, spaces or dashes."),
							error: error.value,
							required: ""
						}, {
							default: withCtx(({ id, describedBy, invalid }) => [createVNode(unref(KInput), {
								id,
								modelValue: name.value,
								"onUpdate:modelValue": ($event) => name.value = $event,
								maxlength: "40",
								autocomplete: "off",
								invalid,
								"aria-describedby": describedBy
							}, null, 8, [
								"id",
								"modelValue",
								"onUpdate:modelValue",
								"invalid",
								"aria-describedby"
							])]),
							_: 1
						}, 8, [
							"label",
							"help",
							"error"
						]), createVNode("div", null, [createVNode(unref(KButton), {
							type: "submit",
							variant: "primary",
							icon: "smiley",
							disabled: !name.value.trim(),
							loading: sending.value
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Say hello")), 1)]),
							_: 1
						}, 8, ["disabled", "loading"])])], 32),
						unref(greetings).meta.value ? (openBlock(), createBlock("dl", {
							key: 0,
							class: "k-facts"
						}, [createVNode("div", null, [createVNode("dt", null, toDisplayString(unref(__)("Today")), 1), createVNode("dd", null, toDisplayString(unref(greetings).meta.value.today), 1)]), createVNode("div", null, [createVNode("dt", null, toDisplayString(unref(__)("In total")), 1), createVNode("dd", null, toDisplayString(unref(greetings).meta.value.total), 1)])])) : createCommentVNode("v-if", true),
						createVNode("p", { class: "k-muted k-small" }, [createVNode(unref(Link), {
							href: "/admin/settings?tab=hello.greeting",
							class: "k-link"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Change the wording")), 1)]),
							_: 1
						})])
					];
				}),
				_: 1
			}, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/admin/Greetings.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as default };
