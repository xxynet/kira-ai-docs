import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.6ab74304.js";
const __pageData = JSON.parse('{"title":"\u5F00\u53D1\u6307\u5357","description":"","frontmatter":{},"headers":[],"relativePath":"development/guide.md","lastUpdated":null}');
const _sfc_main = { name: "development/guide.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="\u5F00\u53D1\u6307\u5357" tabindex="-1">\u5F00\u53D1\u6307\u5357 <a class="header-anchor" href="#\u5F00\u53D1\u6307\u5357" aria-hidden="true">#</a></h1><blockquote><p>\u6587\u6863\u65BD\u5DE5\u4E2D...</p></blockquote></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/guide.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const guide = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  guide as default
};
