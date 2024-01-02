window.App = (() => {
  class Signal {
    val;
    deps = [];

    constructor(val) {
      this.val = val;
      this.deps = [];
    }

    set(setter) {
      this.val = typeof setter === "function" ? setter(this.val) : setter;
      this.notify();
    }

    notify() {
      this.deps.forEach((it) => it());
    }
  }

  const KEYUP_EVENTS = ["enter", "escape"];
  let $state = null;
  let events = new Set();
  let silentRegisterCaller = null;

  const func = (code) =>
    new Function(`with({...arguments[0], ...arguments[1]}) { return ${code} }`);

  function extract({ type, target, key }) {
    return [
      target.getAttribute(`@${type}`),
      target.getAttribute(`@${(key ?? "").toLowerCase()}`),
    ]
      .filter((it) => !!it)
      .map((value) => {
        if (value.indexOf(":/") > -1) {
          const [method, url] = value.split(":");
          const cfg = {
            method,
            url,
            before: target.getAttribute("before"),
          };

          const to = [...target.attributes].find((it) =>
            it.name.startsWith("to")
          );
          if (to) {
            cfg.to = {
              swap:
                to.name.indexOf(":") > -1 ? to.name.split(":")[1] : "replace",
              target: to.value,
            };
          }

          return cfg;
        } else {
          return {
            code: value,
            before: target.getAttribute("before"),
          };
        }
      });
  }

  function isElement({ target, type, key }) {
    if (target.hasAttribute(`@${type}`)) return true;
    if (type === "keyup" && target.hasAttribute(`@${key.toLowerCase()}`))
      return true;
  }

  function getPayload(el) {
    const payload = {};
    if (el.tagName === "INPUT" || el.tagName === "BUTTON") {
      payload[el.name] = el.value;
    }
    return payload;
  }

  async function call(el, { url, method, to }) {
    const payload = getPayload(el);

    const init = { method };
    if (Object.keys(payload).length > 0) {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(payload);
    }

    const resp = await fetch(url, init);

    if (to) {
      const html = await resp.text();

      if (to === "el") {
        el.innerHTML = html;
      } else {
        [...document.querySelectorAll(to.target)].forEach(async (parent) => {
          if (to.swap === "prepend" || to.swap === "append") {
            parent.insertAdjacentHTML(
              to.swap === "append" ? "beforeend" : "afterbegin",
              html
            );
          } else {
            parent.innerHTML = html;
          }

          initElements(parent);
        });
      }
    }
  }

  async function listener(ev) {
    if (!isElement(ev)) return;
    const cfg = extract(ev);
    cfg.forEach((it) => {
      let exec = true;
      if (it.before) {
        exec = func(it.before)($state, { $ev: ev });
      }
      if (!exec) return;

      if (it.code) {
        func(it.code)($state, { $ev: ev });
      } else {
        call(ev.target, it);
      }
    });
  }

  function setup(el) {
    [...el.attributes].forEach(({name, value}) => {
      const prefix = name[0];
      const event = name.slice(1);

      // Events
      if (prefix === "@") {
        if (event === "load") {
          const [method, url] = el.getAttribute("@load").split(":");
          call(el, { url, method, to: "el" });
        } else if (!events.has(event)) {
          events.add(event);
          if (KEYUP_EVENTS.indexOf(event) === -1) {
            document.body.addEventListener(event, listener);
          } else {
            document.body.addEventListener("keyup", (key) => {
              if (key.code.toLowerCase() === event) listener(key);
            });
          }
        }
      }

      // Bindings
      if (prefix === ":") {
        const extractor = func(value);
        silentRegisterCaller = function () {
          if (event === "show") {
            el.style.display = extractor($state, {}) ? "block" : "none";
          } else if (event === "html") {
            el.innerHTML = extractor($state, {});
          } else {
            el.setAttribute(event, extractor($state, {}));
          }
        };
        silentRegisterCaller();
        silentRegisterCaller = null;
      }
    });
    el.dataset.bound = "true";
  }

  function setupState(el) {
    const state = JSON.parse(el.getAttribute(":state").replace(/(\w+):/g, '"$1":'));
    Object.keys(state).forEach((key) => {
      if (!$state.hasOwnProperty(key)) {
        $state[key] = new Signal(state[key]);
      }
    });
  }

  function initElements(parent) {
    const $elements = [...parent.querySelectorAll("*")].filter((el) =>
      [...el.attributes].find(
        ({ name }) => name.startsWith(":") || name.startsWith("@")
      )
    );

    $elements.filter((el) => el.hasAttribute(":state")).forEach(setupState);

    $elements.filter((el) => !el.hasAttribute(":state")).forEach(setup);
  }

  function init() {
    $state = new Proxy({}, {
        get(target, key) {
          if (typeof key === "symbol") return;
          const signal = target[key];
          if (silentRegisterCaller) {
            signal.deps.push(silentRegisterCaller);
          }
          return signal;
        },
      }
    );

    initElements(document);
  }

  init();
  return { $state };
})();
