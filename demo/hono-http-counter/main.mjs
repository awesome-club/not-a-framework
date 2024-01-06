import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { html } from 'hono/html';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get(
	'/static/*',
	serveStatic({
		root: './src',
		rewriteRequestPath: (path) => path.replace(/^\/static/, '')
	})
);

let cachedCount = '0';

const Page = (count) => {
	return html`
		<!DOCTYPE html>
		<html>
			<body>
				<main :state="{count: ${count}, name: null}">
					<h1 :html="count.val" @load="get:/count"></h1>

					<button @click="count.set(old => old - 1)">-1</button>

					<button @click="count.set(old => old + 1)" :show="count.val < 20">+1</button>
					<button @dblclick="count.set(old => old + 10)" :show="count.val < 20">+10</button>

					<footer id="server-actions">
					<button name="count" :value="count.val" @click="post:/count" to:append="#server-actions">Save</button>
					</footer>

					<hr />

					<h2 :html="count.val + ' ' + name.val"></h2>
					<input @keyup="name.set($ev.target.value)" />

					<script src="/static/main.js"></script>
				</main>
			</body>
		</html>
	`;
}

app.get('/', (c) => c.html(Page(cachedCount)));

app.get('/count', (c) => c.text(cachedCount));

const DeleteButton = () => {
	return html`
		<button @click="delete:/count" before="confirm('Are you sure?')">
			Delete
			<span :html="count.val"></span>
		</button>
	`;
}

app.post('/count', async (c) => {
	const { count } = await c.req.json();

	cachedCount = count;

	return c.html(DeleteButton());
});

app.delete('/count', (c) => {
	cachedCount = '0';
	return c.body(null);
});

serve({
	fetch: app.fetch,
	port: 8001
});
