# Not a Framework

**This is an experiment** in removing the complexity of modern frontend development. 
For more context, watch this video: [The Web is Borken. Let's fix it!](https://youtu.be/TaP9Wc_gkI0)

**The goal** is to enhance HTML received from the server, and make it interactive via a handful of special DOM attriutes:

- `x-on` - to register event handlers for various events. Handlers can be either JS code or HTTP Verbs and URLs;
- `x-bind` - to bind DOM elements to Signals;
- `x-to` and `x-html` - to modify DOM content; 

### HTML Example

```
 <div x-bind:class="'chat ' + (open.value ? 'open' : 'close')">
    <header>
      <h3>Awesome Chat</h3>
      <button x-on:click="open.set(old => !old)">⬇️</button>
    </header>
    <main id="messages" x-html="/messages" x-pool="1s"></main>
    <footer>
      <input name="message" x-on:enter="post:/messages" x-to:append="#messages" />
    </footer>
  </div>

  <script src="//naf.js"></script>
  <script defer>
    App.init({
      open: true
    });
  </script>
  ```

### Inspiration
The code is heavily inspired by:
- [HTMX's](https://htmx.org/) server communication;
- [Alpine's](https://alpinejs.dev/) power;
- [Solid's](https://www.solidjs.com/) reactivity;
- [Van's](https://vanjs.org/) simplicity
