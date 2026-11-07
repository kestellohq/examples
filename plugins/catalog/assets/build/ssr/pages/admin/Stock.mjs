import { t as _plugin_vue_export_helper_default } from "../../chunks/_plugin-vue_export-helper-DjkACiAr.mjs";
import { computed, createBlock, createCommentVNode, createSlots, createTextVNode, createVNode, openBlock, reactive, ref, toDisplayString, unref, useSSRContext, watch, withCtx, withModifiers } from "vue";
import { ssrInterpolate, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
import { Head, Link, usePage } from "@kestello/app";
import { ApiError, notify, useApi, useCan, useI18n, useResource } from "@kestello/sdk";
import { KBadge, KButton, KCard, KField, KInput, KModal, KPageHeader, KSelect, KSwitch, KTable, KTime } from "@kestello/ui";
// plugins/catalog/resources/js/pages/admin/Stock.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: "Admin" }, {
	__name: "Stock",
	__ssrInlineRender: true,
	setup(__props) {
		const { __ } = useI18n("catalog");
		/**
		* Catalog → Stock (/admin/p/catalog/stock). Lowest stock first. Everything
		* here goes through the plugin's own endpoints under /api/v1/catalog.
		*/
		const page = usePage();
		const api = useApi();
		const can = useCan();
		const canManage = computed(() => can("catalog.manage"));
		const filters = reactive({
			search: "",
			low: new URLSearchParams(page.url.split("?")[1] ?? "").get("low") === "1",
			page: 1
		});
		const query = computed(() => ({
			search: filters.search.trim() || void 0,
			low: filters.low ? 1 : void 0,
			page: filters.page
		}));
		const stock = useResource("/catalog/stock", { query });
		let debounce = null;
		watch(() => filters.search, () => {
			clearTimeout(debounce);
			debounce = setTimeout(() => {
				filters.page = 1;
			}, 250);
		});
		watch(() => filters.low, () => {
			filters.page = 1;
		});
		const meta = computed(() => stock.meta.value);
		const reasons = computed(() => meta.value?.reasons ?? {});
		const columns = computed(() => [
			{
				key: "title",
				label: __("Product")
			},
			{
				key: "sku",
				label: __("SKU")
			},
			{
				key: "low_at",
				label: __("Low at"),
				align: "end"
			},
			{
				key: "quantity",
				label: __("In stock"),
				align: "end"
			},
			{
				key: "actions",
				label: "",
				align: "end",
				width: "1%"
			}
		]);
		const open = ref(null);
		const detail = ref(null);
		const form = reactive({
			reason: "received",
			amount: "",
			note: ""
		});
		const lowAt = ref("");
		const errors = ref({});
		const saving = ref(false);
		const SIGN = {
			received: 1,
			returned: 1,
			sold: -1,
			damaged: -1,
			counted: 0
		};
		const reasonOptions = computed(() => Object.entries(reasons.value).map(([value, label]) => ({
			value,
			label: __(label)
		})));
		const amountLabel = computed(() => form.reason === "counted" ? __("Quantity counted") : __("How many"));
		async function show(row) {
			open.value = row;
			detail.value = null;
			errors.value = {};
			Object.assign(form, {
				reason: "received",
				amount: "",
				note: ""
			});
			lowAt.value = row.custom_low_at ?? "";
			try {
				detail.value = (await api.get(`/catalog/products/${row.id}/stock`)).data;
			} catch (e) {
				notify.error(e);
			}
		}
		async function record() {
			const n = Number.parseInt(form.amount, 10);
			if (!Number.isFinite(n) || n < 0) {
				errors.value = { amount: __("Enter a whole number.") };
				return;
			}
			saving.value = true;
			errors.value = {};
			try {
				const sign = SIGN[form.reason];
				const { data } = await api.post(`/catalog/products/${open.value.id}/movements`, {
					reason: form.reason,
					amount: sign === 0 ? n : sign * n,
					note: form.note.trim() || void 0
				});
				notify.success(__("{title}: {n} in stock", {
					title: open.value.title,
					n: data.quantity
				}));
				Object.assign(form, {
					amount: "",
					note: ""
				});
				await Promise.all([show(open.value), stock.reload({ silent: true })]);
			} catch (e) {
				if (e instanceof ApiError && e.status === 422) errors.value = { amount: e.fieldErrors().amount ?? e.message };
				else notify.error(e);
			} finally {
				saving.value = false;
			}
		}
		async function saveLowAt() {
			saving.value = true;
			try {
				const value = String(lowAt.value).trim() === "" ? null : Number.parseInt(lowAt.value, 10);
				await api.put(`/catalog/products/${open.value.id}/low-at`, { low_at: value });
				notify.success(__("Low-stock level saved"));
				await stock.reload({ silent: true });
			} catch (e) {
				notify.error(e);
			} finally {
				saving.value = false;
			}
		}
		const signed = (n) => n > 0 ? `+${n}` : String(n);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: unref(__)("Stock") }, null, _parent));
			_push(ssrRenderComponent(unref(KPageHeader), {
				title: unref(__)("Stock"),
				description: unref(__)("How many of each product you have, lowest first. A product is low at or below its level.")
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(KButton), {
							href: "/admin/content/catalog-product",
							icon: "package"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(unref(__)("Products"))}`);
								else return [createTextVNode(toDisplayString(unref(__)("Products")), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						if (canManage.value) _push(ssrRenderComponent(unref(KButton), {
							href: "/admin/settings?tab=catalog.general",
							icon: "gear"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(unref(__)("Settings"))}`);
								else return [createTextVNode(toDisplayString(unref(__)("Settings")), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
					} else return [createVNode(unref(KButton), {
						href: "/admin/content/catalog-product",
						icon: "package"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Products")), 1)]),
						_: 1
					}), canManage.value ? (openBlock(), createBlock(unref(KButton), {
						key: 0,
						href: "/admin/settings?tab=catalog.general",
						icon: "gear"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Settings")), 1)]),
						_: 1
					})) : createCommentVNode("v-if", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="k-toolbar catalog-toolbar" role="search" data-v-3211ea59>`);
			_push(ssrRenderComponent(unref(KField), {
				label: unref(__)("Search products"),
				class: "k-toolbar__grow"
			}, {
				default: withCtx(({ id }, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(unref(KInput), {
						id,
						modelValue: filters.search,
						"onUpdate:modelValue": ($event) => filters.search = $event,
						type: "search",
						autocomplete: "off"
					}, null, _parent, _scopeId));
					else return [createVNode(unref(KInput), {
						id,
						modelValue: filters.search,
						"onUpdate:modelValue": ($event) => filters.search = $event,
						type: "search",
						autocomplete: "off"
					}, null, 8, [
						"id",
						"modelValue",
						"onUpdate:modelValue"
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(unref(KSwitch), {
				modelValue: filters.low,
				"onUpdate:modelValue": ($event) => filters.low = $event,
				label: unref(__)("Only products running low")
			}, null, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(unref(KCard), { flush: "" }, createSlots({
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(unref(KTable), {
						columns: columns.value,
						rows: unref(stock).data.value ?? [],
						loading: unref(stock).loading.value && !unref(stock).data.value,
						caption: unref(__)("Stock"),
						empty: filters.low ? unref(__)("Nothing is running low.") : unref(__)("No products yet. Add one under Content → Products.")
					}, {
						"cell-title": withCtx(({ row }, _push, _parent, _scopeId) => {
							if (_push) {
								_push(ssrRenderComponent(unref(Link), {
									href: `/admin/content/catalog-product/${row.id}`,
									class: "k-link"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`${ssrInterpolate(row.title || unref(__)("(no title)"))}`);
										else return [createTextVNode(toDisplayString(row.title || unref(__)("(no title)")), 1)];
									}),
									_: 2
								}, _parent, _scopeId));
								if (row.status !== "published") _push(ssrRenderComponent(unref(KBadge), { class: "catalog-status" }, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`${ssrInterpolate(row.status === "draft" ? unref(__)("Draft") : row.status)}`);
										else return [createTextVNode(toDisplayString(row.status === "draft" ? unref(__)("Draft") : row.status), 1)];
									}),
									_: 2
								}, _parent, _scopeId));
								else _push(`<!---->`);
							} else return [createVNode(unref(Link), {
								href: `/admin/content/catalog-product/${row.id}`,
								class: "k-link"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.title || unref(__)("(no title)")), 1)]),
								_: 2
							}, 1032, ["href"]), row.status !== "published" ? (openBlock(), createBlock(unref(KBadge), {
								key: 0,
								class: "catalog-status"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.status === "draft" ? unref(__)("Draft") : row.status), 1)]),
								_: 2
							}, 1024)) : createCommentVNode("v-if", true)];
						}),
						"cell-sku": withCtx(({ row }, _push, _parent, _scopeId) => {
							if (_push) {
								if (row.sku) _push(`<code class="k-code" data-v-3211ea59${_scopeId}>${ssrInterpolate(row.sku)}</code>`);
								else _push(`<!---->`);
							} else return [row.sku ? (openBlock(), createBlock("code", {
								key: 0,
								class: "k-code"
							}, toDisplayString(row.sku), 1)) : createCommentVNode("v-if", true)];
						}),
						"cell-low_at": withCtx(({ row }, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="${ssrRenderClass({ "k-muted": row.custom_low_at === null })}" data-v-3211ea59${_scopeId}>${ssrInterpolate(row.low_at)}</span>`);
							else return [createVNode("span", { class: { "k-muted": row.custom_low_at === null } }, toDisplayString(row.low_at), 3)];
						}),
						"cell-quantity": withCtx(({ row }, _push, _parent, _scopeId) => {
							if (_push) {
								if (row.low) _push(ssrRenderComponent(unref(KBadge), { tone: row.quantity === 0 ? "danger" : "warning" }, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`${ssrInterpolate(row.quantity === 0 ? unref(__)("Sold out") : row.quantity)}`);
										else return [createTextVNode(toDisplayString(row.quantity === 0 ? unref(__)("Sold out") : row.quantity), 1)];
									}),
									_: 2
								}, _parent, _scopeId));
								else _push(`<strong class="catalog-qty" data-v-3211ea59${_scopeId}>${ssrInterpolate(row.quantity)}</strong>`);
							} else return [row.low ? (openBlock(), createBlock(unref(KBadge), {
								key: 0,
								tone: row.quantity === 0 ? "danger" : "warning"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.quantity === 0 ? unref(__)("Sold out") : row.quantity), 1)]),
								_: 2
							}, 1032, ["tone"])) : (openBlock(), createBlock("strong", {
								key: 1,
								class: "catalog-qty"
							}, toDisplayString(row.quantity), 1))];
						}),
						"cell-actions": withCtx(({ row }, _push, _parent, _scopeId) => {
							if (_push) _push(ssrRenderComponent(unref(KButton), {
								size: "sm",
								icon: canManage.value ? "plus-minus" : "clock-counter-clockwise",
								onClick: ($event) => show(row)
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`${ssrInterpolate(canManage.value ? unref(__)("Change") : unref(__)("History"))}`);
									else return [createTextVNode(toDisplayString(canManage.value ? unref(__)("Change") : unref(__)("History")), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
							else return [createVNode(unref(KButton), {
								size: "sm",
								icon: canManage.value ? "plus-minus" : "clock-counter-clockwise",
								onClick: ($event) => show(row)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(canManage.value ? unref(__)("Change") : unref(__)("History")), 1)]),
								_: 1
							}, 8, ["icon", "onClick"])];
						}),
						_: 1
					}, _parent, _scopeId));
					else return [createVNode(unref(KTable), {
						columns: columns.value,
						rows: unref(stock).data.value ?? [],
						loading: unref(stock).loading.value && !unref(stock).data.value,
						caption: unref(__)("Stock"),
						empty: filters.low ? unref(__)("Nothing is running low.") : unref(__)("No products yet. Add one under Content → Products.")
					}, {
						"cell-title": withCtx(({ row }) => [createVNode(unref(Link), {
							href: `/admin/content/catalog-product/${row.id}`,
							class: "k-link"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(row.title || unref(__)("(no title)")), 1)]),
							_: 2
						}, 1032, ["href"]), row.status !== "published" ? (openBlock(), createBlock(unref(KBadge), {
							key: 0,
							class: "catalog-status"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(row.status === "draft" ? unref(__)("Draft") : row.status), 1)]),
							_: 2
						}, 1024)) : createCommentVNode("v-if", true)]),
						"cell-sku": withCtx(({ row }) => [row.sku ? (openBlock(), createBlock("code", {
							key: 0,
							class: "k-code"
						}, toDisplayString(row.sku), 1)) : createCommentVNode("v-if", true)]),
						"cell-low_at": withCtx(({ row }) => [createVNode("span", { class: { "k-muted": row.custom_low_at === null } }, toDisplayString(row.low_at), 3)]),
						"cell-quantity": withCtx(({ row }) => [row.low ? (openBlock(), createBlock(unref(KBadge), {
							key: 0,
							tone: row.quantity === 0 ? "danger" : "warning"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(row.quantity === 0 ? unref(__)("Sold out") : row.quantity), 1)]),
							_: 2
						}, 1032, ["tone"])) : (openBlock(), createBlock("strong", {
							key: 1,
							class: "catalog-qty"
						}, toDisplayString(row.quantity), 1))]),
						"cell-actions": withCtx(({ row }) => [createVNode(unref(KButton), {
							size: "sm",
							icon: canManage.value ? "plus-minus" : "clock-counter-clockwise",
							onClick: ($event) => show(row)
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(canManage.value ? unref(__)("Change") : unref(__)("History")), 1)]),
							_: 1
						}, 8, ["icon", "onClick"])]),
						_: 1
					}, 8, [
						"columns",
						"rows",
						"loading",
						"caption",
						"empty"
					])];
				}),
				_: 2
			}, [meta.value && meta.value.last_page > 1 ? {
				name: "footer",
				fn: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="k-pager" data-v-3211ea59${_scopeId}><span class="k-muted" data-v-3211ea59${_scopeId}>${ssrInterpolate(unref(__)("Page {page} of {last} · {total} total", {
							page: meta.value.page,
							last: meta.value.last_page,
							total: meta.value.total
						}))}</span>`);
						_push(ssrRenderComponent(unref(KButton), {
							size: "sm",
							icon: "caret-left",
							disabled: meta.value.page <= 1,
							onClick: ($event) => filters.page--
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(unref(__)("Previous"))}`);
								else return [createTextVNode(toDisplayString(unref(__)("Previous")), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(KButton), {
							size: "sm",
							disabled: meta.value.page >= meta.value.last_page,
							onClick: ($event) => filters.page++
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(unref(__)("Next"))}`);
								else return [createTextVNode(toDisplayString(unref(__)("Next")), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", { class: "k-pager" }, [
						createVNode("span", { class: "k-muted" }, toDisplayString(unref(__)("Page {page} of {last} · {total} total", {
							page: meta.value.page,
							last: meta.value.last_page,
							total: meta.value.total
						})), 1),
						createVNode(unref(KButton), {
							size: "sm",
							icon: "caret-left",
							disabled: meta.value.page <= 1,
							onClick: ($event) => filters.page--
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Previous")), 1)]),
							_: 1
						}, 8, ["disabled", "onClick"]),
						createVNode(unref(KButton), {
							size: "sm",
							disabled: meta.value.page >= meta.value.last_page,
							onClick: ($event) => filters.page++
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Next")), 1)]),
							_: 1
						}, 8, ["disabled", "onClick"])
					])];
				}),
				key: "0"
			} : void 0]), _parent));
			_push(ssrRenderComponent(unref(KModal), {
				open: !!open.value,
				title: open.value?.title ?? "",
				size: "lg",
				onClose: ($event) => open.value = null
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (open.value) {
							_push(`<div class="catalog-detail" data-v-3211ea59${_scopeId}><dl class="k-facts" data-v-3211ea59${_scopeId}><div data-v-3211ea59${_scopeId}><dt data-v-3211ea59${_scopeId}>${ssrInterpolate(unref(__)("In stock"))}</dt><dd data-v-3211ea59${_scopeId}>${ssrInterpolate(detail.value?.quantity ?? open.value.quantity)}</dd></div><div data-v-3211ea59${_scopeId}><dt data-v-3211ea59${_scopeId}>${ssrInterpolate(unref(__)("Low at"))}</dt><dd data-v-3211ea59${_scopeId}>${ssrInterpolate(detail.value?.low_at ?? open.value.low_at)}</dd></div>`);
							if (open.value.sku) _push(`<div data-v-3211ea59${_scopeId}><dt data-v-3211ea59${_scopeId}>${ssrInterpolate(unref(__)("SKU"))}</dt><dd data-v-3211ea59${_scopeId}><code class="k-code" data-v-3211ea59${_scopeId}>${ssrInterpolate(open.value.sku)}</code></dd></div>`);
							else _push(`<!---->`);
							_push(`</dl>`);
							if (canManage.value) {
								_push(`<form class="catalog-move" data-v-3211ea59${_scopeId}>`);
								_push(ssrRenderComponent(unref(KField), { label: unref(__)("What happened") }, {
									default: withCtx(({ id }, _push, _parent, _scopeId) => {
										if (_push) _push(ssrRenderComponent(unref(KSelect), {
											id,
											modelValue: form.reason,
											"onUpdate:modelValue": ($event) => form.reason = $event,
											options: reasonOptions.value
										}, null, _parent, _scopeId));
										else return [createVNode(unref(KSelect), {
											id,
											modelValue: form.reason,
											"onUpdate:modelValue": ($event) => form.reason = $event,
											options: reasonOptions.value
										}, null, 8, [
											"id",
											"modelValue",
											"onUpdate:modelValue",
											"options"
										])];
									}),
									_: 1
								}, _parent, _scopeId));
								_push(ssrRenderComponent(unref(KField), {
									label: amountLabel.value,
									error: errors.value.amount,
									required: ""
								}, {
									default: withCtx(({ id, describedBy, invalid }, _push, _parent, _scopeId) => {
										if (_push) _push(ssrRenderComponent(unref(KInput), {
											id,
											modelValue: form.amount,
											"onUpdate:modelValue": ($event) => form.amount = $event,
											type: "number",
											min: "0",
											step: "1",
											inputmode: "numeric",
											invalid,
											"aria-describedby": describedBy
										}, null, _parent, _scopeId));
										else return [createVNode(unref(KInput), {
											id,
											modelValue: form.amount,
											"onUpdate:modelValue": ($event) => form.amount = $event,
											type: "number",
											min: "0",
											step: "1",
											inputmode: "numeric",
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
								_push(ssrRenderComponent(unref(KField), {
									label: unref(__)("Note"),
									class: "catalog-move__note"
								}, {
									default: withCtx(({ id }, _push, _parent, _scopeId) => {
										if (_push) _push(ssrRenderComponent(unref(KInput), {
											id,
											modelValue: form.note,
											"onUpdate:modelValue": ($event) => form.note = $event,
											maxlength: "200",
											placeholder: unref(__)("Order number, supplier…")
										}, null, _parent, _scopeId));
										else return [createVNode(unref(KInput), {
											id,
											modelValue: form.note,
											"onUpdate:modelValue": ($event) => form.note = $event,
											maxlength: "200",
											placeholder: unref(__)("Order number, supplier…")
										}, null, 8, [
											"id",
											"modelValue",
											"onUpdate:modelValue",
											"placeholder"
										])];
									}),
									_: 1
								}, _parent, _scopeId));
								_push(`<div class="catalog-move__submit" data-v-3211ea59${_scopeId}>`);
								_push(ssrRenderComponent(unref(KButton), {
									type: "submit",
									variant: "primary",
									loading: saving.value
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`${ssrInterpolate(unref(__)("Record"))}`);
										else return [createTextVNode(toDisplayString(unref(__)("Record")), 1)];
									}),
									_: 1
								}, _parent, _scopeId));
								_push(`</div></form>`);
							} else _push(`<!---->`);
							_push(`<h3 class="k-h3" data-v-3211ea59${_scopeId}>${ssrInterpolate(unref(__)("History"))}</h3>`);
							_push(ssrRenderComponent(unref(KTable), {
								columns: [
									{
										key: "created_at",
										label: unref(__)("When")
									},
									{
										key: "reason",
										label: unref(__)("What")
									},
									{
										key: "change",
										label: unref(__)("Change"),
										align: "end"
									},
									{
										key: "quantity_after",
										label: unref(__)("After"),
										align: "end"
									}
								],
								rows: detail.value?.movements ?? [],
								loading: !detail.value,
								empty: unref(__)("No movements yet.")
							}, {
								"cell-created_at": withCtx(({ row }, _push, _parent, _scopeId) => {
									if (_push) {
										_push(ssrRenderComponent(unref(KTime), { value: row.created_at }, null, _parent, _scopeId));
										if (row.user) _push(`<div class="k-muted k-small" data-v-3211ea59${_scopeId}>${ssrInterpolate(row.user)}</div>`);
										else _push(`<!---->`);
									} else return [createVNode(unref(KTime), { value: row.created_at }, null, 8, ["value"]), row.user ? (openBlock(), createBlock("div", {
										key: 0,
										class: "k-muted k-small"
									}, toDisplayString(row.user), 1)) : createCommentVNode("v-if", true)];
								}),
								"cell-reason": withCtx(({ row }, _push, _parent, _scopeId) => {
									if (_push) {
										_push(`${ssrInterpolate(unref(__)(reasons.value[row.reason] ?? row.reason))} `);
										if (row.note) _push(`<div class="k-muted k-small" data-v-3211ea59${_scopeId}>${ssrInterpolate(row.note)}</div>`);
										else _push(`<!---->`);
									} else return [createTextVNode(toDisplayString(unref(__)(reasons.value[row.reason] ?? row.reason)) + " ", 1), row.note ? (openBlock(), createBlock("div", {
										key: 0,
										class: "k-muted k-small"
									}, toDisplayString(row.note), 1)) : createCommentVNode("v-if", true)];
								}),
								"cell-change": withCtx(({ row }, _push, _parent, _scopeId) => {
									if (_push) _push(`<span class="${ssrRenderClass([row.change < 0 ? "is-out" : "is-in", "catalog-qty"])}" data-v-3211ea59${_scopeId}>${ssrInterpolate(signed(row.change))}</span>`);
									else return [createVNode("span", { class: ["catalog-qty", row.change < 0 ? "is-out" : "is-in"] }, toDisplayString(signed(row.change)), 3)];
								}),
								_: 1
							}, _parent, _scopeId));
							if (canManage.value) {
								_push(`<form class="catalog-low" data-v-3211ea59${_scopeId}>`);
								_push(ssrRenderComponent(unref(KField), {
									label: unref(__)("Low-stock level for this product"),
									help: unref(__)("Leave empty to use the site-wide level ({n}).", { n: meta.value?.default_low_at ?? 5 })
								}, {
									default: withCtx(({ id, describedBy }, _push, _parent, _scopeId) => {
										if (_push) _push(ssrRenderComponent(unref(KInput), {
											id,
											modelValue: lowAt.value,
											"onUpdate:modelValue": ($event) => lowAt.value = $event,
											type: "number",
											min: "0",
											step: "1",
											inputmode: "numeric",
											"aria-describedby": describedBy
										}, null, _parent, _scopeId));
										else return [createVNode(unref(KInput), {
											id,
											modelValue: lowAt.value,
											"onUpdate:modelValue": ($event) => lowAt.value = $event,
											type: "number",
											min: "0",
											step: "1",
											inputmode: "numeric",
											"aria-describedby": describedBy
										}, null, 8, [
											"id",
											"modelValue",
											"onUpdate:modelValue",
											"aria-describedby"
										])];
									}),
									_: 1
								}, _parent, _scopeId));
								_push(ssrRenderComponent(unref(KButton), {
									type: "submit",
									loading: saving.value
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`${ssrInterpolate(unref(__)("Save level"))}`);
										else return [createTextVNode(toDisplayString(unref(__)("Save level")), 1)];
									}),
									_: 1
								}, _parent, _scopeId));
								_push(`</form>`);
							} else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
					} else return [open.value ? (openBlock(), createBlock("div", {
						key: 0,
						class: "catalog-detail"
					}, [
						createVNode("dl", { class: "k-facts" }, [
							createVNode("div", null, [createVNode("dt", null, toDisplayString(unref(__)("In stock")), 1), createVNode("dd", null, toDisplayString(detail.value?.quantity ?? open.value.quantity), 1)]),
							createVNode("div", null, [createVNode("dt", null, toDisplayString(unref(__)("Low at")), 1), createVNode("dd", null, toDisplayString(detail.value?.low_at ?? open.value.low_at), 1)]),
							open.value.sku ? (openBlock(), createBlock("div", { key: 0 }, [createVNode("dt", null, toDisplayString(unref(__)("SKU")), 1), createVNode("dd", null, [createVNode("code", { class: "k-code" }, toDisplayString(open.value.sku), 1)])])) : createCommentVNode("v-if", true)
						]),
						canManage.value ? (openBlock(), createBlock("form", {
							key: 0,
							class: "catalog-move",
							onSubmit: withModifiers(record, ["prevent"])
						}, [
							createVNode(unref(KField), { label: unref(__)("What happened") }, {
								default: withCtx(({ id }) => [createVNode(unref(KSelect), {
									id,
									modelValue: form.reason,
									"onUpdate:modelValue": ($event) => form.reason = $event,
									options: reasonOptions.value
								}, null, 8, [
									"id",
									"modelValue",
									"onUpdate:modelValue",
									"options"
								])]),
								_: 1
							}, 8, ["label"]),
							createVNode(unref(KField), {
								label: amountLabel.value,
								error: errors.value.amount,
								required: ""
							}, {
								default: withCtx(({ id, describedBy, invalid }) => [createVNode(unref(KInput), {
									id,
									modelValue: form.amount,
									"onUpdate:modelValue": ($event) => form.amount = $event,
									type: "number",
									min: "0",
									step: "1",
									inputmode: "numeric",
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
							}, 8, ["label", "error"]),
							createVNode(unref(KField), {
								label: unref(__)("Note"),
								class: "catalog-move__note"
							}, {
								default: withCtx(({ id }) => [createVNode(unref(KInput), {
									id,
									modelValue: form.note,
									"onUpdate:modelValue": ($event) => form.note = $event,
									maxlength: "200",
									placeholder: unref(__)("Order number, supplier…")
								}, null, 8, [
									"id",
									"modelValue",
									"onUpdate:modelValue",
									"placeholder"
								])]),
								_: 1
							}, 8, ["label"]),
							createVNode("div", { class: "catalog-move__submit" }, [createVNode(unref(KButton), {
								type: "submit",
								variant: "primary",
								loading: saving.value
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Record")), 1)]),
								_: 1
							}, 8, ["loading"])])
						], 32)) : createCommentVNode("v-if", true),
						createVNode("h3", { class: "k-h3" }, toDisplayString(unref(__)("History")), 1),
						createVNode(unref(KTable), {
							columns: [
								{
									key: "created_at",
									label: unref(__)("When")
								},
								{
									key: "reason",
									label: unref(__)("What")
								},
								{
									key: "change",
									label: unref(__)("Change"),
									align: "end"
								},
								{
									key: "quantity_after",
									label: unref(__)("After"),
									align: "end"
								}
							],
							rows: detail.value?.movements ?? [],
							loading: !detail.value,
							empty: unref(__)("No movements yet.")
						}, {
							"cell-created_at": withCtx(({ row }) => [createVNode(unref(KTime), { value: row.created_at }, null, 8, ["value"]), row.user ? (openBlock(), createBlock("div", {
								key: 0,
								class: "k-muted k-small"
							}, toDisplayString(row.user), 1)) : createCommentVNode("v-if", true)]),
							"cell-reason": withCtx(({ row }) => [createTextVNode(toDisplayString(unref(__)(reasons.value[row.reason] ?? row.reason)) + " ", 1), row.note ? (openBlock(), createBlock("div", {
								key: 0,
								class: "k-muted k-small"
							}, toDisplayString(row.note), 1)) : createCommentVNode("v-if", true)]),
							"cell-change": withCtx(({ row }) => [createVNode("span", { class: ["catalog-qty", row.change < 0 ? "is-out" : "is-in"] }, toDisplayString(signed(row.change)), 3)]),
							_: 1
						}, 8, [
							"columns",
							"rows",
							"loading",
							"empty"
						]),
						canManage.value ? (openBlock(), createBlock("form", {
							key: 1,
							class: "catalog-low",
							onSubmit: withModifiers(saveLowAt, ["prevent"])
						}, [createVNode(unref(KField), {
							label: unref(__)("Low-stock level for this product"),
							help: unref(__)("Leave empty to use the site-wide level ({n}).", { n: meta.value?.default_low_at ?? 5 })
						}, {
							default: withCtx(({ id, describedBy }) => [createVNode(unref(KInput), {
								id,
								modelValue: lowAt.value,
								"onUpdate:modelValue": ($event) => lowAt.value = $event,
								type: "number",
								min: "0",
								step: "1",
								inputmode: "numeric",
								"aria-describedby": describedBy
							}, null, 8, [
								"id",
								"modelValue",
								"onUpdate:modelValue",
								"aria-describedby"
							])]),
							_: 1
						}, 8, ["label", "help"]), createVNode(unref(KButton), {
							type: "submit",
							loading: saving.value
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(__)("Save level")), 1)]),
							_: 1
						}, 8, ["loading"])], 32)) : createCommentVNode("v-if", true)
					])) : createCommentVNode("v-if", true)];
				}),
				_: 1
			}, _parent));
			_push(`<!--]-->`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/admin/Stock.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Stock_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-3211ea59"]]);
export { Stock_default as default };
