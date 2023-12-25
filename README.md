# Not a Framework

_Contributions and ideas are welcome!_

**This is an experiment** in removing the complexity of modern frontend development.
For more context, watch this video. [The Web is Borken. Let's fix it!](https://youtu.be/TaP9Wc_gkI0)

**The goal** is to enhance HTML received from the server, and make it interactive in a seamless way. This is currently achieved using only two building blocks:
- Events captured via `@` DOM attributes. (Example: `@click`, `@keyup`, `@load`)
- DOM bindings via `:` DOM attributes. (Example: `:value`, `:class`, `:html`)


### HTML Basic Example

```
<main :state="{count: 0}">
    <h1 :html="count.val" @load="get:/count"></h1>

    <button @click="count.set(old => old + 1)">+1</button>
    <button @dblclick="count.set(old => old + 10)">+10</button>

    <button name="count" :value="count.val" @click="post:/count">Save</button>
</main>
  ```

### Events
- You can capture all standard DOM events (`@click`, `@dblclick`, ...);
- You have access to 3 special events:
    - `@enter` - keyup event with Enter pressed;
    - `@escape` - keyup event with Escape pressed;
    - `@load` - DOM element is loaded in the page.
- Attribute values can be:
    - Server calls `method:<url>` which will be performed asynchronously to change server state;
    - JS code to change local signal based state.

### Bindings
- You can bind any DOM attribute to a Signal value (`:name`, `:value`, ...)
- You have access to 2 special bindings:
    - `:state` accepts a JS objects and adds Signals to the local state;
    -  `:html` to bind the element.innerHTML to a Signal.

### Inspiration
The code is heavily inspired by:
- [HTMX's](https://htmx.org/) server communication;
- [Alpine's](https://alpinejs.dev/) DX;
- [Solid's](https://www.solidjs.com/) reactivity;
- [Van's](https://vanjs.org/) simplicity.
