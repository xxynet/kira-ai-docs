import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.6ab74304.js";
const __pageData = JSON.parse('{"title":"API\u53C2\u8003","description":"","frontmatter":{},"headers":[],"relativePath":"development/api.md","lastUpdated":null}');
const _sfc_main = { name: "development/api.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="api\u53C2\u8003" tabindex="-1">API\u53C2\u8003 <a class="header-anchor" href="#api\u53C2\u8003" aria-hidden="true">#</a></h1><blockquote><p>\u6587\u6863\u65BD\u5DE5\u4E2D...</p></blockquote></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/api.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const api = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  api as default
};
