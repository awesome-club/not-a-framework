# Not a Framework

_Contributions and ideas are welcome!_

**This is an experiment** in removing the complexity of modern frontend development.
For more context, watch these videos:
- [The Web is Broken. Let's fix it!](https://youtu.be/TaP9Wc_gkI0)
- [What I Learned From Building a Framework](https://youtu.be/qzQ8fKLDUyo)

**The goal** is to enhance the  HTML received from the server, and make it interactive in a seamless manner. This is achieved using only two building blocks:
- Event listeners registered  via `@` DOM attributes. (Example: `@click`, `@keyup`, `@load`)
- Reactive bindings via `:` DOM attributes. (Example: `:value`, `:class`, `:html`)


### HTML Basic Example

```html
<!-- Define a count signal in the scope $state object. -->
<main :state="{count: 0}">
  <!-- Make a get call to "/count" to populate the element when loaded in the page.
       Once loaded, bound the element's innert html to the count signal. -->
  <h1 :html="count.val" @load="get:/count"></h1>

  <!-- Decrease the count signal value by one on click. -->
  <button @click="count.set(old => old - 1)">-1</button>
  
  <!-- Increase the count signal value by one on click. -->
  <button @click="count.set(old => old + 1)">+1</button>
  
  <!-- Increase the count signal value by ten on double click.
       Hide the button when the signal value is larger than ten. -->
  <button @dblclick="count.set(old => old + 10)" :show="count.val < 10">+10</button>

  <!-- Sent an async post request to the server on click with the name and value attributes as payload. -->
  <button @click="post:/count" name="count" :value="count.val">Save</button>
  
  <!-- Sent an async delete request to the server on click. -->
  <button @click="delete:/count">Delete</button>
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
    - Elements triggering server calls can have a `to`, `to:prepend` or `to:append` attribute defining a target element whenre the server response would be inserted.
  - JS code to change local signal based state;
  - Elements triggering events can have a `before` attribute which executes JS code. If the before function returns false, the event handler will not be executed.

### Bindings
- You can bind any DOM attribute to a Signal value (`:name`, `:value`, ...)
- You have access to 2 special bindings:
  - `:state` accepts a JS objects and adds Signals to the local state;
  - `:html` to bind the element.innerHTML to a Signal;
  - `:show` to bind the element.style.display to `block` or `nonde`.


| Number of Lines | Size Minified | Size Gzipped |
|-----------------|---------------|--------------|
| 201             | 2.7kb         | 1.3kb        |


### Inspiration
The code is heavily inspired by:
- [HTMX's](https://htmx.org/) server communication;
- [Alpine's](https://alpinejs.dev/) DX;
- [Solid's](https://www.solidjs.com/) reactivity;
- [Van's](https://vanjs.org/) simplicity.
