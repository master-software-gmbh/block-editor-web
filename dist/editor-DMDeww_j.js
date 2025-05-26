var V = Object.defineProperty;
var Z = (n, t, e) => t in n ? V(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var O = (n, t, e) => Z(n, typeof t != "symbol" ? t + "" : t, e);
import { n as v, D as H, u as j, t as B, _ as C, l as I, a as m, b as y, e as Y, c as E, L as G, r as k, d as Q, f as T, g as D, h as tt, B as et, R as nt, T as ot, F as it, i as st, j as _, k as N, m as U, p as q, q as rt } from "./main-CK0EKtSQ.js";
function lt(n) {
  return Object.keys(n).map((t) => {
    let e = n[t];
    if (e == null)
      return `${t}=`;
    if (typeof e == "object" ? e = JSON.stringify(e) : e = e.toString(), typeof e == "string") {
      const i = e.includes(" ") || e.includes("="), o = e.includes('"') || e.includes("\\");
      o && (e = e.replace(/["\\]/g, "\\$&")), (i || o) && (e = `"${e}"`);
    }
    return `${t}=${e}`;
  }).join(" ");
}
class at {
  constructor(t) {
    this.format = t;
  }
  debug(t, e = {}) {
    console.debug(this._serialize(t, "debug", e));
  }
  info(t, e = {}) {
    console.info(this._serialize(t, "info", e));
  }
  warn(t, e = {}) {
    console.warn(this._serialize(t, "warn", e));
  }
  error(t, e = {}) {
    console.error(this._serialize(t, "error", e));
  }
  _serialize(t, e, i = {}) {
    const o = this._data(t, e, i);
    switch (this.format) {
      case "json":
        try {
          return JSON.stringify(o);
        } catch {
          return String(o);
        }
      case "logfmt":
        return lt(o);
    }
  }
  _data(t, e, i = {}) {
    const { message: o, level: s, error: r, ...l } = i, a = {
      level: e,
      message: t,
      data_level: s,
      data_message: o,
      ...l
    };
    return r && r instanceof Error && (a.error = {
      name: r.name,
      stack: r.stack,
      message: r.message
    }), a;
  }
}
const h = new at("json");
async function L(n, t) {
  const e = Date.now(), [i] = await Promise.all([n(), new Promise((s) => setTimeout(s, t))]), o = Date.now() - e;
  return o > t + 5 && h.warn("Constant-time operation took longer than expected", {
    duration_ms: o,
    min_duration_ms: t
  }), i;
}
function K(n, t) {
  let e;
  return (...i) => {
    window.clearTimeout(e), e = window.setTimeout(() => {
      n(...i);
    }, t);
  };
}
function R(n) {
  return {
    get(t) {
      return t[n];
    },
    set(t, e) {
      return { ...t, [n]: e };
    }
  };
}
function A(n, t) {
  return n.get(t);
}
function W(n, t, e) {
  return n.set(t, e);
}
function P(n, t) {
  return {
    get(e) {
      return A(t, A(n, e));
    },
    set(e, i) {
      return W(n, e, W(t, A(n, e), i));
    }
  };
}
function ct(n) {
  return {
    get(t) {
      const e = typeof n == "function" ? n(t) : n;
      return t[e];
    },
    set(t, e) {
      const i = typeof n == "function" ? n(t) : n;
      return t.map((o, s) => s === i ? e : o);
    }
  };
}
function dt(n) {
  return ct((t) => t.findIndex((e) => e.id === n));
}
function z(n, t) {
  for (const [e, i] of Object.entries(n))
    if (!(typeof i == "boolean" && !i && !(e in t)) && (!(e in t) || i !== t[e]))
      return !1;
  return !0;
}
class $ {
  constructor(t, e) {
    O(this, "document");
    O(this, "selection");
    this.document = t, this.selection = e;
  }
}
h.format = "logfmt";
let ft = class {
  constructor(t) {
    O(this, "uuidFactory");
    this.uuidFactory = t ?? crypto.randomUUID.bind(crypto);
  }
  applyAction(t, e) {
    var i, o;
    switch (e.type) {
      case "insert_text": {
        const s = e.text.split(`

`);
        let r = t;
        for (const [l, a] of s.entries())
          r = this.replaceText(r, a), l < s.length - 1 && (r = this.replaceText(r, `
`));
        return r;
      }
      case "delete_text": {
        if (t.selection.length === 1) {
          const s = t.selection[0];
          if (s.startOffset === s.endOffset) {
            if (s.startOffset > 0)
              s.startOffset -= 1, console.log("Deleting previous character");
            else if (s.type === "rich_text") {
              const r = t.document.children.findIndex((a) => a.id === s.blockId), l = t.document.children.slice(0, r).reverse().find((a) => a.type === "rich-text");
              (l == null ? void 0 : l.type) === "rich-text" && t.selection.unshift({
                type: "rich_text",
                blockId: l.id,
                spanIndex: l.content.spans.length - 1,
                startOffset: ((i = l.content.spans.at(-1)) == null ? void 0 : i.text.length) ?? 0,
                endOffset: ((o = l.content.spans.at(-1)) == null ? void 0 : o.text.length) ?? 0
              });
            }
          }
        }
        return this.replaceText(t, "");
      }
      case "set_attribute":
        return this.applyAttributes(t, { [e.name]: e.value });
      case "toggle_attribute": {
        const r = !!!this.getRangeAttribute(t, e.name);
        return this.applyAttributes(t, { [e.name]: r });
      }
      case "move_block":
        return this.moveBlock(t, e.id, e.index);
      case "remove_block":
        return this.removeBlock(t, e.id);
      case "insert_paragraph":
        return this.replaceText(t, `
`);
      default:
        return t;
    }
  }
  getRangeAttribute(t, e) {
    for (const i of t.selection) {
      if (i.type !== "rich_text")
        continue;
      const o = this.getBlockById(t.document, i.blockId);
      if ((o == null ? void 0 : o.type) === "rich-text") {
        const s = o.content.spans.at(i.spanIndex);
        if (!(s != null && s.attributes[e]))
          return !1;
      }
    }
    return !0;
  }
  moveBlock(t, e, i) {
    const o = this.getBlockById(t.document, e);
    if (o) {
      const s = t.document.children.indexOf(o);
      s > -1 && (s < i && (i -= 1), h.debug(`Moving block ${e} from ${s} to ${i}`), t.document.children.splice(s, 1), t.document.children.splice(i, 0, o));
    }
    return t;
  }
  removeBlock(t, e) {
    const i = t.document.children.findIndex((o) => o.id === e);
    return i > -1 && t.document.children.splice(i, 1), t;
  }
  getBlockById(t, e) {
    return t.children.find((i) => i.id === e);
  }
  applyAttributes(t, e) {
    const i = [], o = t.document;
    for (const s of o.children) {
      if (s.type !== "rich-text")
        continue;
      const r = [];
      for (const [l, a] of s.content.spans.entries()) {
        const f = t.selection.find(
          (p) => p.type === "rich_text" && p.blockId === s.id && p.spanIndex === l
        );
        if ((f == null ? void 0 : f.type) !== "rich_text") {
          r.push(a);
          continue;
        }
        const { after: d, before: c, inside: x } = this.splitSpan(a, f);
        c.length && r.push({
          ...a,
          text: c
        }), x.length && (i.push({
          type: "rich_text",
          blockId: s.id,
          spanIndex: r.length,
          startOffset: 0,
          endOffset: x.length
        }), r.push({
          ...a,
          text: x,
          attributes: {
            ...a.attributes,
            ...e
          }
        })), d.length && r.push({
          ...a,
          text: d
        });
      }
      s.content.spans = r;
    }
    return new $(o, i);
  }
  splitSpan(t, e) {
    const i = t.text.slice(0, e.startOffset), o = t.text.slice(e.startOffset, e.endOffset), s = t.text.slice(e.endOffset ?? e.startOffset);
    return {
      before: i,
      inside: o,
      after: s
    };
  }
  expandRange(t, e) {
    const i = e.at(0), o = e.at(1);
    if ((i == null ? void 0 : i.type) !== "rich_text" || (o == null ? void 0 : o.type) !== "rich_text")
      return e;
    const s = [], r = t.children.findIndex((f) => f.id === i.blockId), l = t.children.findIndex((f) => f.id === o.blockId), a = t.children.slice(r, l + 1);
    for (const f of a)
      if (f.type === "rich-text") {
        for (const [d, c] of f.content.spans.entries())
          if (!(f.id === i.blockId && d < i.spanIndex)) {
            if (f.id === i.blockId && d === i.spanIndex) {
              s.push(i);
              continue;
            }
            if (!(f.id === o.blockId && d > o.spanIndex)) {
              if (f.id === o.blockId && d === o.spanIndex) {
                s.push(o);
                continue;
              }
              s.push({
                type: "rich_text",
                blockId: f.id,
                spanIndex: d,
                startOffset: 0,
                endOffset: c.text.length
              });
            }
          }
      }
    return s;
  }
  createEmptyRichTextBlock(t) {
    const e = this.uuidFactory();
    return {
      children: [],
      id: e,
      type: "rich-text",
      content: {
        spans: [
          {
            text: "",
            attributes: t
          }
        ]
      }
    };
  }
  replaceText(t, e) {
    h.info(`Replacing text with "${e}"`);
    const i = [];
    let o = [];
    const s = t.selection.at(0);
    if ((s == null ? void 0 : s.type) === "rich_text")
      o = [
        {
          type: "rich_text",
          blockId: s.blockId,
          spanIndex: s.spanIndex,
          startOffset: s.startOffset + e.length
        }
      ];
    else if ((s == null ? void 0 : s.type) === "plain_text") {
      const d = e.replace(/\n/g, "");
      o = [
        {
          type: "plain_text",
          blockId: s.blockId,
          property: s.property,
          startOffset: s.startOffset + d.length,
          endOffset: s.startOffset + d.length
        }
      ];
    }
    let r = e;
    const l = (d) => {
      const c = JSON.parse(JSON.stringify(d));
      return c.content.spans = [], c;
    };
    let a;
    for (const d of t.selection)
      if (d.type === "title")
        if (e === `
`) {
          const c = this.createEmptyRichTextBlock({});
          o = [
            {
              blockId: c.id,
              spanIndex: 0,
              startOffset: 0,
              type: "rich_text"
            }
          ], r = "", i.push(c);
        } else {
          const c = e.replace(/\n/g, "");
          t.document.content.title = t.document.content.title.slice(0, d.startOffset) + c + t.document.content.title.slice(d.endOffset);
          const x = d.startOffset + c.length, p = d.startOffset + c.length;
          o = [
            {
              type: "title",
              startOffset: x,
              endOffset: p
            }
          ];
        }
    for (const d of t.document.children) {
      a || (a = l(d));
      let c = !1, x = !1;
      if (d.type === "rich-text")
        for (const [p, g] of d.content.spans.entries()) {
          const u = t.selection.findIndex(
            (w) => w.type === "rich_text" && w.blockId === d.id && w.spanIndex === p
          ), S = u === -1 ? void 0 : t.selection.at(u);
          if ((S == null ? void 0 : S.type) !== "rich_text")
            a.content.spans.push(g);
          else {
            x = !0, u === t.selection.length - 1 && (c = !0);
            const { before: w, after: J } = this.splitSpan(g, S);
            a.content.spans.push({
              text: w,
              attributes: g.attributes
            }), r === `
` && (i.push(a), a = this.createEmptyRichTextBlock(g.attributes), o = [
              {
                blockId: a.id,
                spanIndex: 0,
                startOffset: 0,
                type: "rich_text"
              }
            ], r = ""), a.content.spans.push({
              text: r + J,
              attributes: g.attributes
            }), r = "";
          }
        }
      else {
        const p = t.selection.find(
          (g) => g.type === "plain_text" && g.blockId === (a == null ? void 0 : a.id)
        );
        if ((p == null ? void 0 : p.type) === "plain_text" && p.property in a.content) {
          const g = a.content[p.property], u = r.replace(/\n/g, "");
          a.content[p.property] = g.slice(0, p.startOffset) + u + g.slice(p.endOffset);
        }
      }
      (c || !x) && (i.push(a), a = void 0);
    }
    a && i.push(a);
    const f = this.optimizeDocument(F.set(t.document, i), o);
    return new $(f, o);
  }
  optimizeDocument(t, e) {
    let i = t;
    for (const o of t.children)
      o.type === "rich-text" && (i = P(F, dt(o.id)).set(
        i,
        this.optimizeRichTextBlock(o, e)
      ));
    return i = F.set(
      i,
      i.children.filter((o) => !(o.type === "rich-text" && o.content.spans.length === 0))
    ), i;
  }
  optimizeRichTextBlock(t, e) {
    var o;
    const i = [];
    for (const [s, r] of t.content.spans.entries()) {
      const l = i.at(i.length - 1);
      if (r.text.length === 0) {
        const a = e.at(0);
        (a == null ? void 0 : a.type) === "rich_text" && a.blockId === t.id && a.spanIndex === s && s > 0 && (a.spanIndex = s - 1, a.startOffset = ((o = i.at(-1)) == null ? void 0 : o.text.length) ?? 0);
        continue;
      }
      if (l && this.compareAttributes(l.attributes, r.attributes)) {
        l.text += r.text;
        continue;
      }
      i.push(r);
    }
    return i.length === 0 && i.push({
      text: "",
      attributes: {}
    }), P(ut, pt).set(t, i);
  }
  compareAttributes(t, e) {
    return z(t, e) && z(e, t);
  }
};
const F = R("children"), ut = R("content"), pt = R("spans");
class ht {
  constructor() {
    O(this, "blockEditor", new ft());
  }
  applyAction(t, e) {
    return this.blockEditor.applyAction(new $(t, []), e);
  }
  applyRangeAction(t, e, i) {
    const o = this.selectionToEditorRange(t, i);
    return this.blockEditor.applyAction(new $(t, o), e);
  }
  selectionToEditorRange(t, e) {
    let i = e;
    if (!i) {
      const s = window.getSelection();
      i = s == null ? void 0 : s.getRangeAt(0);
    }
    let o = [];
    if (!i)
      console.warn("No range found for action");
    else {
      const s = this.getShallowEditorRange(i);
      o = this.blockEditor.expandRange(t, s);
    }
    return o;
  }
  updateWindowSelection(t) {
    const e = this.editorRangeToSelection(t);
    if (e) {
      const i = window.getSelection();
      i == null || i.removeAllRanges(), i == null || i.addRange(e);
    }
  }
  editorRangeToSelection(t) {
    const e = new Range(), i = t.at(0), o = t.at(-1);
    if (!i || !o)
      return e;
    if (i.type === "title" && o.type === "title") {
      const s = document.querySelector('[data-element="title"]');
      if (s) {
        const r = this.findTextChild(s);
        r && (e.setStart(r, i.startOffset), e.setEnd(r, o.endOffset ?? 0));
      }
      return e;
    }
    if (i.type === "plain_text" && o.type === "plain_text") {
      const s = document.querySelector(`[data-block-id="${i.blockId}"]`), r = s == null ? void 0 : s.querySelector(`[data-editing-property="${i.property}"]`);
      if (r) {
        const l = this.findTextChild(r);
        l && (e.setStart(l, i.startOffset), e.setEnd(l, o.endOffset ?? i.startOffset));
      }
      return e;
    }
    if (i.type === "rich_text" && o.type === "rich_text") {
      const s = this.findSpanTextNode(i.blockId, i.spanIndex);
      s && e.setStart(s, i.startOffset);
      const r = this.findSpanTextNode(o.blockId, o.spanIndex);
      r && e.setEnd(r, o.endOffset ?? o.startOffset);
    }
    return e;
  }
  getShallowEditorRange(t) {
    var l, a, f, d;
    let e = null, i = 0, o = null, s, r;
    if (this.normalizeRange(t), t.startContainer instanceof Text)
      e = this.getElementAtNode(t.startContainer), i = t.startOffset;
    else if (t.startContainer instanceof Element)
      if (t.startOffset > t.startContainer.children.length) {
        if (e = this.getLastChildElement(t.startContainer), (e == null ? void 0 : e.type) === "span") {
          const c = this.getSpanTextContent(e.blockId, e.index);
          i = (c == null ? void 0 : c.length) ?? 0, r = i;
        }
      } else
        e = this.getElementAtNode(t.startContainer), i = ((l = t.startContainer.textContent) == null ? void 0 : l.length) ?? 0;
    if (t.endContainer instanceof Text)
      o = this.getElementAtNode(t.endContainer);
    else if (t.endContainer instanceof Element) {
      if (t.endOffset === 0)
        o = this.getFirstChildElement(t.endContainer);
      else if (o = this.getLastChildElement(t.endContainer), (o == null ? void 0 : o.type) === "span") {
        const c = this.getSpanTextContent(o.blockId, o.index);
        s = (c == null ? void 0 : c.length) ?? 0;
      }
      o === null && (o = this.getElementAtNode(t.endContainer), s = ((a = t.endContainer.textContent) == null ? void 0 : a.length) ?? 0);
    }
    if ((e == null ? void 0 : e.type) === "block")
      return [
        {
          type: "rich_text",
          blockId: e.blockId,
          spanIndex: 0,
          startOffset: i,
          endOffset: t.endOffset
        }
      ];
    if ((e == null ? void 0 : e.type) === "plain")
      return [
        {
          type: "plain_text",
          blockId: e.blockId,
          property: e.property,
          startOffset: i,
          endOffset: t.endOffset
        }
      ];
    if ((e == null ? void 0 : e.type) !== "span" || (o == null ? void 0 : o.type) !== "span") {
      let c;
      return (e == null ? void 0 : e.type) === "title" && o === null ? c = ((f = t.startContainer.textContent) == null ? void 0 : f.length) ?? 0 : c = Math.max(t.startOffset, t.endOffset), [
        {
          type: "title",
          startOffset: t.startOffset,
          endOffset: c
        }
      ];
    }
    return !e || !o ? [] : e.blockId === o.blockId && e.index === o.index ? [
      {
        type: "rich_text",
        blockId: e.blockId,
        spanIndex: e.index,
        startOffset: i,
        endOffset: s ?? t.endOffset
      }
    ] : [
      {
        type: "rich_text",
        blockId: e.blockId,
        spanIndex: e.index,
        startOffset: i,
        endOffset: r ?? ((d = t.startContainer.textContent) == null ? void 0 : d.length)
      },
      {
        type: "rich_text",
        blockId: o.blockId,
        spanIndex: o.index,
        startOffset: 0,
        endOffset: s ?? t.endOffset
      }
    ];
  }
  normalizeRange(t) {
    const e = (o) => {
      var s, r;
      if (o.startContainer.nodeType !== Node.TEXT_NODE) {
        let l = null, a = 0;
        o.startOffset === o.startContainer.childNodes.length ? (l = o.startContainer.lastChild, a = ((s = l == null ? void 0 : l.textContent) == null ? void 0 : s.length) ?? 0) : l = o.startContainer.childNodes.item(o.startOffset), (l == null ? void 0 : l.nodeType) === Node.TEXT_NODE ? (o.setStart(l, a), console.log("Set range start to child node")) : console.log("Failed to set range start to child node");
      }
      if (o.endContainer.nodeType !== Node.TEXT_NODE) {
        let l = null, a = 0;
        o.endOffset === o.endContainer.childNodes.length ? (l = o.endContainer.lastChild, a = ((r = l == null ? void 0 : l.textContent) == null ? void 0 : r.length) ?? 0) : l = o.endContainer.childNodes.item(o.endOffset), (l == null ? void 0 : l.nodeType) === Node.TEXT_NODE ? (o.setEnd(l, a), console.log("Set range end to child node")) : console.log("Failed to set range end to child node");
      }
    }, i = (o) => {
      if (o.startContainer.nodeType === Node.TEXT_NODE && o.startContainer.textContent === "" && o.startOffset === 0) {
        const s = o.startContainer.previousSibling;
        if (s)
          o.setStart(s, s.childNodes.length), console.log("Set range start to previous sibling");
        else {
          const r = o.startContainer.nextSibling;
          r && (o.setStart(r, 0), console.log("Set range start to next sibling"));
        }
      }
      if (o.endContainer.nodeType === Node.TEXT_NODE && o.endContainer.textContent === "" && o.endOffset === 0) {
        const s = o.endContainer.previousSibling;
        if (s)
          o.setEnd(s, s.childNodes.length), console.log("Set range end to previous sibling");
        else {
          const r = o.endContainer.nextSibling;
          r && (o.setEnd(r, 0), console.log("Set range end to next sibling"));
        }
      }
    };
    return e(t), i(t), e(t), t;
  }
  findChildAttribute(t, e) {
    if (t instanceof Element && t.hasAttribute(e))
      return t.getAttribute(e);
    for (const i of t.childNodes) {
      if (i instanceof Element && i.hasAttribute(e))
        return i.getAttribute(e);
      const o = this.findChildAttribute(i, e);
      if (o)
        return o;
    }
    return null;
  }
  findAttribute(t, e) {
    return t instanceof Element && t.hasAttribute(e) ? t.getAttribute(e) : t.parentElement ? this.findAttribute(t.parentElement, e) : null;
  }
  findTextChild(t) {
    return t instanceof Text ? t : t.firstChild ? this.findTextChild(t.firstChild) : t;
  }
  findSpanTextNode(t, e) {
    var o;
    const i = (o = document.querySelector(`[data-block-id="${t}"]`)) == null ? void 0 : o.querySelector(`[data-span-index="${e}"]`);
    return i ? this.findTextChild(i) : null;
  }
  getSpanTextContent(t, e) {
    var s;
    const i = (s = document.querySelector(`[data-block-id="${t}"]`)) == null ? void 0 : s.querySelector(`[data-span-index="${e}"]`);
    if (!i)
      return null;
    const o = this.findTextChild(i);
    return o ? o.textContent : null;
  }
  getFirstChildElement(t) {
    for (let e = 0; e < t.childNodes.length; e++) {
      const i = t.childNodes[e];
      if (this.isSpanNode(i)) {
        const o = this.getElementAtNode(i);
        if (o)
          return o;
      } else if (i instanceof Element) {
        const o = this.getFirstChildElement(i);
        if (o)
          return o;
      }
    }
    return null;
  }
  getLastChildElement(t) {
    for (let e = t.childNodes.length - 1; e >= 0; e--) {
      const i = t.childNodes[e];
      if (this.isSpanNode(i)) {
        const o = this.getElementAtNode(i);
        if (o)
          return o;
      } else if (i instanceof Element) {
        const o = this.getLastChildElement(i);
        if (o)
          return o;
      }
    }
    return null;
  }
  isSpanNode(t) {
    return t instanceof Element ? t.hasAttribute("data-span-index") : !1;
  }
  getElementAtNode(t) {
    const e = this.findAttribute(t, "data-span-index"), i = this.findAttribute(t, "data-editing-type"), o = this.findAttribute(t, "data-editing-property"), s = this.findAttribute(t, "data-block-id");
    return e && s ? {
      blockId: s,
      type: "span",
      index: Number.parseInt(e)
    } : i === "plain" && o && s ? {
      type: "plain",
      blockId: s,
      property: o
    } : s ? {
      type: "block",
      blockId: s
    } : this.findAttribute(t, "data-element") === "title" ? {
      type: "title"
    } : null;
  }
}
const M = {
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown"
};
class X {
  constructor(t) {
    O(this, "config");
    this.config = t;
  }
  static defaultSave(t) {
    return async (e) => {
      await fetch(t, {
        method: "PUT",
        body: JSON.stringify(e),
        headers: {
          "Content-Type": "application/json"
        }
      });
    };
  }
  get callbacks() {
    return this.config.callbacks;
  }
  isEnabled(t) {
    var e;
    return ((e = this.config.features) == null ? void 0 : e[t]) === !0;
  }
}
O(X, "Feature", {
  FileUpload: "file-upload"
});
const mt = v({
  setup() {
    const n = j();
    return {
      dragging: B(!1),
      fileUpload: n.isEnabled(X.Feature.FileUpload)
    };
  },
  methods: {
    handleDragEnter(n) {
      n.preventDefault(), this.dragging = !0;
    },
    handleDragOver(n) {
      n.preventDefault();
    },
    handleDragLeave(n) {
      this.dragging = !1;
    },
    handleDrop(n) {
      if (n.preventDefault(), this.dragging = !1, !n.dataTransfer)
        return;
      const t = n.dataTransfer.getData(H.BlockId);
      t != null && t.length && this.$emit("move", t), this.fileUpload && (n.dataTransfer.items ? [...n.dataTransfer.items].forEach((e, i) => {
        if (e.kind === "file") {
          const o = e.getAsFile();
          o && this.$emit("file", o);
        }
      }) : [...n.dataTransfer.files].forEach((e, i) => {
        this.$emit("file", e);
      }));
    }
  }
});
function gt(n, t, e, i, o, s) {
  return m(), I("div", {
    class: Y({ dragging: n.dragging }),
    "data-element": "insertion-target",
    contenteditable: "false"
  }, [
    y("div", {
      onDragenter: t[0] || (t[0] = (...r) => n.handleDragEnter && n.handleDragEnter(...r)),
      onDragover: t[1] || (t[1] = (...r) => n.handleDragOver && n.handleDragOver(...r)),
      onDragleave: t[2] || (t[2] = (...r) => n.handleDragLeave && n.handleDragLeave(...r)),
      onDrop: t[3] || (t[3] = (...r) => n.handleDrop && n.handleDrop(...r))
    }, null, 32)
  ], 2);
}
const yt = /* @__PURE__ */ C(mt, [["render", gt], ["__scopeId", "data-v-cb48d0ab"]]), bt = v({
  props: {
    block: {
      type: Object,
      required: !0
    },
    placeholder: {
      type: String,
      required: !1
    },
    autofocus: {
      type: Boolean,
      required: !1,
      default: !1
    }
  }
}), kt = ["autofocus", "data-block-id", "data-block-type", "data-placeholder"], xt = { "data-editing-mode": "plain" };
function It(n, t, e, i, o, s) {
  return m(), I("div", {
    "data-element": "block",
    autofocus: n.autofocus,
    "data-block-id": n.block.id,
    "data-block-type": n.block.type,
    "data-placeholder": n.placeholder
  }, [
    y("span", xt, E(n.block.content.text), 1)
  ], 8, kt);
}
const wt = /* @__PURE__ */ C(bt, [["render", It], ["__scopeId", "data-v-75aca143"]]), St = v({
  emits: ["formatBold", "formatItalic", "formatUnderline"]
}), Tt = {
  id: "floating-bar",
  contenteditable: "false"
};
function Ot(n, t, e, i, o, s) {
  return m(), I("div", Tt, [
    y("button", {
      onClick: t[0] || (t[0] = (r) => n.$emit("formatBold")),
      style: { "font-weight": "bold" }
    }, "F"),
    y("button", {
      onClick: t[1] || (t[1] = (r) => n.$emit("formatItalic")),
      style: { "font-style": "italic" }
    }, "K"),
    y("button", {
      onClick: t[2] || (t[2] = (r) => n.$emit("formatUnderline")),
      style: { "text-decoration": "underline" }
    }, "U")
  ]);
}
const Ct = /* @__PURE__ */ C(St, [["render", Ot], ["__scopeId", "data-v-189ffbff"]]), vt = {}, Bt = {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24px",
  viewBox: "0 -960 960 960",
  width: "24px",
  fill: "currentColor"
};
function _t(n, t) {
  return m(), I("svg", Bt, t[0] || (t[0] = [
    y("path", { d: "m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" }, null, -1)
  ]));
}
const Et = /* @__PURE__ */ C(vt, [["render", _t]]), $t = v({
  props: {
    status: {
      type: String,
      required: !0
    },
    document: {
      type: Object,
      required: !0
    }
  },
  computed: {
    wordStatus() {
      return this.wordCount > 1 ? `${this.wordCount} Wörter` : this.wordCount === 1 ? "1 Wort" : "0 Wörter";
    },
    wordCount() {
      let n = 0;
      for (const t of this.document.children)
        "text" in t.content && (n += t.content.text.split(/\s+/).filter((e) => e.length > 0).length);
      return n;
    },
    characterStatus() {
      return `${this.characterCount} Zeichen`;
    },
    characterCount() {
      let n = 0;
      for (const t of this.document.children)
        "text" in t.content && (n += t.content.text.length);
      return n;
    }
  },
  components: {
    CheckCircleIcon: Et,
    LoadingSpinnerIcon: G
  }
}), At = { key: 0 }, Ft = { key: 1 };
function Rt(n, t, e, i, o, s) {
  const r = k("CheckCircleIcon"), l = k("LoadingSpinnerIcon");
  return m(), I("div", null, [
    y("p", null, E(n.characterStatus) + ", " + E(n.wordStatus), 1),
    n.status === "saved" ? (m(), I("p", At, [
      T(r),
      t[0] || (t[0] = D(" Gespeichert "))
    ])) : n.status === "saving" ? (m(), I("p", Ft, [
      T(l),
      t[1] || (t[1] = D(" Wird gespeichert "))
    ])) : Q("", !0)
  ]);
}
const Dt = /* @__PURE__ */ C($t, [["render", Rt], ["__scopeId", "data-v-da3db461"]]), Nt = v({
  props: {
    block: {
      type: Object,
      required: !0
    }
  }
}), Ut = ["data-block-id", "data-block-type"];
function qt(n, t, e, i, o, s) {
  return m(), I("div", {
    "data-element": "block",
    "data-block-id": n.block.id,
    "data-block-type": n.block.type
  }, [
    y("code", null, E(n.block.content), 1)
  ], 8, Ut);
}
const Lt = /* @__PURE__ */ C(Nt, [["render", qt]]), b = new ht(), Kt = v({
  setup() {
    const n = j(), t = st(), e = B(t), i = B(!1), o = B("idle"), s = K(async () => {
      o.value = "saving", await L(async () => {
        var r, l;
        await ((l = (r = n.callbacks).onSave) == null ? void 0 : l.call(r, e.value));
      }, 1e3), i.value = !1, o.value = "saved";
    }, 1500);
    return {
      dirty: i,
      status: o,
      autoSave: s,
      document: e,
      onSave: n.callbacks.onSave,
      onExit: n.callbacks.onExit,
      onUpload: n.callbacks.onUpload,
      getFileSourceUrl: n.callbacks.getFileSourceUrl,
      files: B({})
    };
  },
  computed: {
    placeholder() {
      return this.isEmptyDocument ? "Beginne zu schreiben.." : void 0;
    },
    isEmptyDocument() {
      if (this.document.children.length > 1)
        return !1;
      for (const n of this.document.children)
        if ("text" in n.content && n.content.text.trim().length)
          return !1;
      return !0;
    }
  },
  mounted() {
    const n = this.document.children.at(-1);
    if ((n == null ? void 0 : n.type) === "rich-text") {
      const e = n.content.spans.at(-1);
      e && b.updateWindowSelection([
        {
          blockId: n.id,
          type: "rich_text",
          spanIndex: n.content.spans.length - 1,
          startOffset: e.text.length,
          endOffset: e.text.length
        }
      ]);
    }
    const t = K(this.handleSelectionChange, 150);
    document.addEventListener("selectionchange", t), window.addEventListener("beforeunload", (e) => {
      if (this.dirty)
        return e.preventDefault(), e.returnValue = "You have unsaved changes. Are you sure you want to leave?", e.returnValue;
    });
  },
  methods: {
    handleBeforeInput(n) {
      n.preventDefault();
      const t = window.getSelection(), e = t == null ? void 0 : t.getRangeAt(0);
      if (!e) {
        h.warn("Received beforeinput event without range", { type: n.inputType });
        return;
      }
      const i = this.getPlainInputData(n);
      switch (n.inputType) {
        case "insertText":
          return i ? this.handleInsertText(e, i) : void 0;
        case "insertLineBreak":
        case "insertParagraph":
          return this.handleInsertParagraph(e);
        case "insertFromPaste":
          return i ? this.handlePaste(e, i) : void 0;
        case "formatBold":
          return this.handleFormatBold(e);
        case "formatItalic":
          return this.handleFormatItalic(e);
        case "formatUnderline":
          return this.handleFormatUnderline(e);
        case "deleteContentBackward":
        case "deleteByCut":
          return this.handleDeleteContentBackward(e);
        case "insertReplacementText":
          return i ? this.handleInsertText(e, i) : void 0;
        default:
          h.warn("Unhandled beforeinput event", { type: n.inputType });
      }
    },
    handleSelectionChange() {
      const n = window.getSelection();
      if (!n) {
        h.warn("Selection is null");
        return;
      }
      const t = document.getElementById("floating-bar");
      if (!t)
        return;
      const e = n.getRangeAt(0);
      if (!b.selectionToEditorRange(this.document, e).find((r) => r.type === "rich_text") || e.collapsed) {
        t.style.display = "none";
        return;
      }
      t.style.display = "flex";
      const s = e.getBoundingClientRect();
      t.style.top = `${s.top + window.scrollY - t.offsetHeight - 10}px`, t.style.left = `${s.left + window.scrollX - 10}px`;
    },
    getPlainInputData(n) {
      var t;
      return n.data ? n.data : (t = n.dataTransfer) == null ? void 0 : t.getData("text/plain");
    },
    handleFormatBold(n) {
      const t = b.applyRangeAction(
        this.document,
        {
          type: "toggle_attribute",
          name: "bold"
        },
        n
      );
      this.updateEditorState(t);
    },
    handleFormatItalic(n) {
      const t = b.applyRangeAction(
        this.document,
        {
          type: "toggle_attribute",
          name: "italic"
        },
        n
      );
      this.updateEditorState(t);
    },
    handleFormatUnderline(n) {
      const t = b.applyRangeAction(
        this.document,
        {
          type: "toggle_attribute",
          name: "underline"
        },
        n
      );
      this.updateEditorState(t);
    },
    handleDeleteContentBackward(n) {
      const t = b.applyRangeAction(
        this.document,
        {
          type: "delete_text"
        },
        n
      );
      this.updateEditorState(t);
    },
    handleInsertText(n, t) {
      const e = b.applyRangeAction(
        this.document,
        {
          type: "insert_text",
          text: t
        },
        n
      );
      this.updateEditorState(e);
    },
    handleInsertParagraph(n) {
      const t = b.applyRangeAction(
        this.document,
        {
          type: "insert_paragraph"
        },
        n
      );
      this.updateEditorState(t);
    },
    insertBlock(n, t) {
      const e = t ?? this.document.children.length;
      this.document.children.splice(e, 0, n), this.dirty = !0, this.$nextTick(() => {
        this.autoSave();
      });
    },
    handlePaste(n, t) {
      const e = b.applyRangeAction(
        this.document,
        {
          type: "insert_text",
          text: t
        },
        n
      );
      this.updateEditorState(e);
    },
    updateEditorState(n) {
      this.document = n.document, this.dirty = !0, this.$nextTick(() => {
        b.updateWindowSelection(n.selection), this.autoSave();
      });
    },
    handleMove(n, t) {
      const e = b.applyAction(this.document, {
        id: n,
        index: t,
        type: "move_block"
      });
      this.updateEditorState(e);
    },
    handleFileDrop(n, t) {
      this.addFile(n, t);
    },
    handleRemoveBlock(n) {
      const t = b.applyAction(this.document, {
        id: n,
        type: "remove_block"
      });
      this.updateEditorState(t);
    },
    handleKeydown(n) {
      const t = n.shiftKey || n.altKey || n.metaKey || n.ctrlKey, e = n.ctrlKey || n.metaKey;
      switch (n.key) {
        case "a":
          if (e)
            return n.preventDefault(), this.handleSelectAll();
          break;
        case M.ArrowUp:
          return t ? void 0 : (n.preventDefault(), this.handleArrowUpKey());
        case M.ArrowDown:
          return t ? void 0 : (n.preventDefault(), this.handleArrowDownKey());
      }
    },
    handleArrowUpKey() {
      h.debug("Arrow Up key pressed");
    },
    handleArrowDownKey() {
      h.debug("Arrow Down key pressed");
    },
    handleArrowLeftKey() {
      h.debug("Arrow Left key pressed");
    },
    handleArrowRightKey() {
      h.debug("Arrow Right key pressed");
    },
    handleSelectAll() {
      h.debug("Select All pressed");
    },
    async handleSave() {
      var n, t;
      await ((n = this.onSave) == null ? void 0 : n.call(this, this.document)), this.dirty = !1, (t = this.onExit) == null || t.call(this);
    },
    handleAddFile(n) {
      if (n.target instanceof HTMLInputElement && n.target.files)
        for (let t = 0; t < n.target.files.length; t++) {
          const e = n.target.files.item(t);
          if (!e)
            return;
          this.addFile(e);
        }
    },
    addFile(n, t) {
      const e = this.getFileType(n);
      if (!e) {
        h.warn("Unsupported file type", { file: n });
        return;
      }
      const i = crypto.randomUUID();
      this.files[i] = {
        state: "pending",
        type: e,
        source: n
      };
      const o = {
        id: crypto.randomUUID(),
        type: "file-ref",
        content: {
          id: i,
          name: n.name.split(".").at(0) ?? n.name,
          type: n.type
        },
        children: []
      };
      this.insertBlock(o, t), this.uploadFile(i);
    },
    getFileType(n) {
      if (n.type.startsWith("audio/"))
        return "audio";
      if (n.type.startsWith("image/"))
        return "image";
    },
    async uploadFile(n) {
      const t = this.files[n];
      if (!t) {
        h.warn("File not found", { id: n });
        return;
      }
      const e = await L(async () => {
        var i;
        return (i = this.onUpload) == null ? void 0 : i.call(this, t.source, this.document.id, n);
      }, 1e3);
      e && this.files[n] && (this.files[n].state = e);
    }
  },
  components: {
    StatusBar: Dt,
    FileBlock: it,
    TitleBlock: ot,
    RootWrapper: nt,
    UnknownBlock: Lt,
    BlockWrapper: et,
    RichTextBlock: tt,
    PlainTextBlock: wt,
    RichTextFloatingBar: Ct,
    BlockInsertionTarget: yt
  }
}), Wt = { contenteditable: "false" }, Pt = {
  class: "bottom",
  contenteditable: "false"
}, zt = { contenteditable: "false" };
function Mt(n, t, e, i, o, s) {
  const r = k("TitleBlock"), l = k("BlockInsertionTarget"), a = k("RichTextBlock"), f = k("FileBlock"), d = k("UnknownBlock"), c = k("BlockWrapper"), x = k("StatusBar"), p = k("RichTextFloatingBar"), g = k("RootWrapper");
  return m(), _(g, null, {
    default: N(() => [
      y("div", {
        "data-element": "editor",
        contenteditable: "true",
        onBeforeinput: t[2] || (t[2] = (...u) => n.handleBeforeInput && n.handleBeforeInput(...u)),
        onKeydown: t[3] || (t[3] = (...u) => n.handleKeydown && n.handleKeydown(...u))
      }, [
        y("div", Wt, [
          U(n.$slots, "title", {
            onSave: n.handleSave,
            onAddFile: n.handleAddFile,
            onFormatBold: () => n.handleFormatBold(),
            onFormatItalic: () => n.handleFormatItalic(),
            onFormatUnderline: () => n.handleFormatUnderline()
          }, void 0, !0)
        ]),
        T(r, {
          title: n.document.content.title
        }, null, 8, ["title"]),
        (m(!0), I(q, null, rt(n.document.children, (u, S) => (m(), I(q, null, [
          T(l, {
            onMove: (w) => n.handleMove(w, S),
            onFile: (w) => n.handleFileDrop(w, S)
          }, null, 8, ["onMove", "onFile"]),
          T(c, {
            "block-id": u.id
          }, {
            default: N(() => [
              u.type === "rich-text" ? (m(), _(a, {
                key: 0,
                block: u,
                placeholder: S === 0 ? n.placeholder : void 0
              }, null, 8, ["block", "placeholder"])) : u.type === "file-ref" && n.getFileSourceUrl ? (m(), _(f, {
                key: 1,
                block: u,
                file: n.files[u.content.id],
                source: n.getFileSourceUrl(u.content.id),
                onRemove: n.handleRemoveBlock
              }, null, 8, ["block", "file", "source", "onRemove"])) : (m(), _(d, {
                key: 2,
                block: u
              }, null, 8, ["block"]))
            ]),
            _: 2
          }, 1032, ["block-id"])
        ], 64))), 256)),
        T(l, {
          onMove: t[0] || (t[0] = (u) => n.handleMove(u, n.document.children.length)),
          onFile: t[1] || (t[1] = (u) => n.handleFileDrop(u, n.document.children.length))
        }),
        t[4] || (t[4] = y("hr", { style: { "margin-top": "5em" } }, null, -1)),
        y("div", Pt, [
          T(x, {
            document: n.document,
            status: n.status
          }, null, 8, ["document", "status"]),
          U(n.$slots, "bottom", { onSave: n.handleSave }, void 0, !0)
        ]),
        y("div", zt, [
          T(p, {
            onFormatBold: n.handleFormatBold,
            onFormatItalic: n.handleFormatItalic,
            onFormatUnderline: n.handleFormatUnderline
          }, null, 8, ["onFormatBold", "onFormatItalic", "onFormatUnderline"])
        ])
      ], 32)
    ]),
    _: 3
  });
}
const Vt = /* @__PURE__ */ C(Kt, [["render", Mt], ["__scopeId", "data-v-7b155972"]]);
export {
  Vt as B,
  X as C
};
