window.App = (() => {
  class Signal {
    value;
    dependencies = [];
    constructor(value) {
      this.value = value; this.dependencies = []
    }
    set(setter) {
      this.value = setter(this.value);
      this.notify();
    }
    notify() {
      this.dependencies.forEach(it => it());
    }
  }

  let silentRegisterCaller = null;

  function checkBindings(parent) {
    const elements = [...parent.querySelectorAll("*")]
      .filter(it => [...it.attributes].find(attr => attr.name.startsWith("x-bind")));

    elements.forEach(it => {
      const key = it.getAttributeNames().find(it => it.startsWith("x-bind"));
      const code = it.getAttribute(key);
      const extractor = new Function(`with(arguments[0]) { return ${code}}`);
      silentRegisterCaller = function() {
        if (key.indexOf(":") > -1) {
          const attr = key.split(":")[1];
          it.setAttribute(attr, extractor(App.$state));
        } else {
          it.innerHTML = extractor(App.$state);
        }
      }
      silentRegisterCaller();
      silentRegisterCaller = null;
    });
  }

  function extract({type, target, key}) {
    let value = target.getAttribute(`x-on:${type}`);
    if (!value) {
      value = target.getAttribute(`x-on:${key.toLowerCase()}`);
    }

    if (value.indexOf(":/") === -1) {
      return { code: value };
    } else {
      const [method, url] = value.split(":");
      const to = [...target.attributes].find(it => it.name.startsWith("x-to"));

      return {
        method,
        url,
        to: {
          swap: to.name.indexOf(":") > -1 ? to.name.split(":")[1] : "replace",
          target: to.value
        },
        confirm: target.getAttribute("x-confirm")
      }
    }
  }

  function isTargetedElement({target, type, key}) {
    if (target.hasAttribute(`x-on:${type}`)) return true;
    if (type === "keyup" && target.hasAttribute(`x-on:${key.toLowerCase()}`)) return true;
  }

  function getPayload(el) {
    const payload = {};
    if (el.tagName === "INPUT") {
      payload[el.name] = el.value;
    }
    return payload;
  }

  async function call(el, {url, method, to}) {
    const payload = getPayload(el);

    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    [...document.querySelectorAll(to.target)].forEach(async it => {
      const html = await resp.text();
      if (to.swap === "prepend" || to.swap === "append") {
        it.insertAdjacentHTML(to.swap === "append" ? "beforeend" : "afterbegin", html);
      } else {
        it.innerHTML = html;
      }
    });
  }

  async function listener(ev) {
    if (!isTargetedElement(ev)) return;

    const cfg = extract(ev);
    if (cfg.code) {
      const func = new Function(`with(arguments[0]) {${cfg.code}}`);
      func(App.$state);
    } else {
      if (!cfg.confirm) {
        call(ev.target, cfg);
      } else if (cfg.confirm) {
        if (confirm(cfg.confirm ?? "Are you sure?")) {
          call(ev.target, cfg);
        }
      }
    }
  }

  const KEYUP_EVENTS = ["enter", "esc"];

  function init(data) {
    [...document.querySelectorAll("*")]
      .map(it => {
        const attr = [...it.attributes].find(attr => attr.name.startsWith("x-on"));
        if (!attr) return "";
        return attr.name.indexOf(":") > -1 ? attr.name.split(":")[1] : attr.name;
      })
      .filter(it => !!it)
      .forEach(it => {
        if (KEYUP_EVENTS.indexOf(it) === -1) {
          document.body.addEventListener(it, listener);
        } else {
          document.body.addEventListener("keyup", ev => {
            if (ev.code.toLowerCase() === it) listener(ev);
          });
        }
      });

    [...document.querySelectorAll("[x-html]")].forEach(it => {
      async function get() {
        const resp = await fetch(it.getAttribute("x-html"));
        it.innerHTML = await resp.text();
      }
      get();
      let pool = it.getAttribute("x-pool");
      if (pool) {
        let raw = parseFloat(pool);
        pool = pool.indexOf("m") > -1 ? raw * 60 : raw;
        setInterval(get, pool * 1000);
      }
    });

    const signals = {};
    Object.entries(data).forEach(([key, value]) => {
      signals[key] = new Signal(value);
    });
    App.$state = new Proxy(signals, {
      get(target, key){
        if (typeof key === "symbol") return;
        const signal = target[key];
        if (silentRegisterCaller) {
          signal.dependencies.push(silentRegisterCaller);
        }
        return signal;
      }
    });
    checkBindings(document.body);
  }

  return {
    init
  }
})();
