/**
 * 1. UUID 配置：请修改为您自己的 UUID,地址后面加上UUID会返回Hello World!
 */
const k1 = 'xxxxxxxxxxxxxxxxxxxxxxxxxxx';

/**
 * 2. 跳转节点池：当直连失败或需要中转时使用的 ProxyIP 列表
 */
const p1 = ["google.com", "apple.com"];

/**
 * 3. 伪装网页：非 WebSocket 请求或非法访问将跳转至此域名
 */
const s1 = 'www.bing.com';

import { connect as c1 } from 'cloudflare:sockets';

const rid = new Uint8Array(k1.replace(/-/g, '').match(/.{1,2}/g).map(b => parseInt(b, 16)));
const decoder = new TextDecoder();
let idx = 0;

export default {
	async fetch(r1) {
		try {
			const u1 = new URL(r1.url);
			const h1 = r1.headers;

			if (h1.get('Upgrade')?.toLowerCase() !== 'websocket') {
				const p = u1.pathname;
				if (p.length === 37 && p.indexOf(k1) === 1) return new Response('Hello World!', { status: 200 });
				return fetch(`https://${s1}${p}`, r1);
			}

			const [a1, b1] = Object.values(new WebSocketPair());
			b1.accept();

			const s2 = f1(b1, h1.get('sec-websocket-protocol'));

			let r2 = { v: null };
			let d1 = null;

			s2.pipeTo(new WritableStream({
				async write(c2) {
					if (d1) return d1(c2);
					if (r2.v) {
						const w1 = r2.v.writable.getWriter();
						await w1.write(c2);
						w1.releaseLock();
						return;
					}

					const b = new Uint8Array(c2);
					const h2 = f2(b, rid);
					if (h2.e) return;

					const v1 = new Uint8Array([b[0], 0]);
					const p3 = c2.slice(h2.i);

					if (h2.u && h2.p === 53) {
						const { w: w2 } = await f3(b1, v1);
						d1 = w2; d1(p3); return;
					}

					await f4(r2, h2.a, h2.p, p3, b1, v1);
				}
			})).catch(() => b1.close());

			return new Response(null, { status: 101, webSocket: a1 });
		} catch { return new Response(null, { status: 400 }); }
	}
};

function f1(w, h) {
	let c = false;
	return new ReadableStream({
		start(ctrl) {
			w.addEventListener('message', (e) => { if (!c) ctrl.enqueue(e.data); });
			w.addEventListener('close', () => { if (!c) { c = true; ctrl.close(); } });
			w.addEventListener('error', () => { if (!c) { c = true; ctrl.close(); } });
			if (h) {
				try {
					const b = atob(h.replace(/-/g, '+').replace(/_/g, '/'));
					ctrl.enqueue(Uint8Array.from(b, (x) => x.charCodeAt(0)).buffer);
				} catch {}
			}
		}
	});
}

function f2(b, rid) {
	if (b.length < 24) return { e: true };
	for (let i = 0; i < 16; i++) if (b[i + 1] !== rid[i]) return { e: true };
	const o = b[17];
	const p = (b[19 + o] << 8) | b[20 + o];
	const aI = 21 + o;
	const aT = b[aI];
	let aL = 0, aV = '', vI = aI + 1;
	if (aT === 1) { aV = `${b[vI]}.${b[vI+1]}.${b[vI+2]}.${b[vI+3]}`; aL = 4; }
	else if (aT === 2) { aL = b[vI++]; aV = decoder.decode(b.subarray(vI, vI + aL)); }
	else if (aT === 3) { aL = 16; aV = "ipv6"; }
	return { e: false, a: aV, p: p, i: vI + aL, v: b[0], u: b[18 + o] === 2 };
}

async function f4(r, a, p, d, w, v) {
	const g = async (h, pt) => {
		const s = c1({ hostname: h, port: pt });
		r.v = s;
		const wr = s.writable.getWriter();
		await wr.write(d);
		wr.releaseLock();
		return s;
	};
	try {
		f5(await g(a, p), w, v);
	} catch {
		const rI = p1[idx % p1.length];
		idx = (idx + 1) & 1023;
		f5(await g(rI, 443), w, v);
	}
}

function f5(s, w, h) {
	let head = h;
	s.readable.pipeTo(new WritableStream({
		async write(c) {
			if (w.readyState !== 1) return;
			if (head) {
				w.send(await new Blob([head, c]).arrayBuffer());
				head = null;
			} else {
				w.send(c);
			}
		}
	})).catch(() => w.close());
}

async function f3(w, v) {
	let s = false;
	const t = new TransformStream({
		transform(c, ctrl) {
			const b = new Uint8Array(c);
			for (let i = 0; i < b.length;) {
				const l = (b[i] << 8) | b[i + 1];
				ctrl.enqueue(b.subarray(i + 2, i + 2 + l));
				i += 2 + l;
			}
		}
	});
	t.readable.pipeTo(new WritableStream({
		async write(c) {
			const r = await fetch('https://cloudflare-dns.com/dns-query', { 
				method: 'POST', 
				body: c, 
				headers: { 'accept': 'application/dns-message', 'content-type': 'application/dns-message' },
				cf: { cacheEverything: true, cacheTtl: 3600 } 
			});
			const d = await r.arrayBuffer();
			if (w.readyState === 1) {
				const sl = new Uint8Array([(d.byteLength >> 8) & 0xff, d.byteLength & 0xff]);
				w.send(await new Blob([s ? sl : new Uint8Array([...v, ...sl]), d]).arrayBuffer());
				s = true;
			}
		}
	}));
	const wr = t.writable.getWriter();
	return { w: (c) => wr.write(c) };
}
