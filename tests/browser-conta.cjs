const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");
const { createServer } = require("../server.cjs");
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "iflibrary-browser-"));
  fs.writeFileSync(
    path.join(dir, "db.json"),
    JSON.stringify({ usuarios: [], pedidos: [], livros: [] }),
  );
  const api = createServer(path.join(dir, "db.json")).listen(0, "127.0.0.1");
  await new Promise((resolve) => api.once("listening", resolve));
  process.env.VITE_API_URL = "http://127.0.0.1:" + api.address().port;
  const { createServer: viteServer } = await import("vite");
  const vuePlugin = (await import("@vitejs/plugin-vue")).default;
  const vite = await viteServer({
    configFile: false,
    plugins: [vuePlugin()],
    resolve: { alias: { "@": path.resolve("src") } },
    server: { host: "127.0.0.1", port: 5178, strictPort: true },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(
        "http://127.0.0.1:" + api.address().port,
      ),
    },
  });
  await vite.listen();
  const portServer = require("node:net").createServer().listen(0, "127.0.0.1");
  await new Promise((resolve) => portServer.once("listening", resolve));
  const debugPort = portServer.address().port;
  await new Promise((resolve) => portServer.close(resolve));
  const edge = spawn(
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--remote-debugging-port=" + debugPort,
      "--user-data-dir=" + path.join(dir, "edge"),
      "about:blank",
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  let socket;
  try {
    let page;
    for (let i = 0; i < 80; i++) {
      try {
        page = (
          await (await fetch("http://127.0.0.1:" + debugPort + "/json")).json()
        ).find((p) => p.type === "page");
        if (page) break;
      } catch {
        // O navegador ainda está iniciando.
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    assert.ok(page, "Edge iniciou");
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve) =>
      socket.addEventListener("open", resolve, { once: true }),
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    let sequence = 0;
    const pending = new Map();
    socket.addEventListener("message", (event) => {
      const m = JSON.parse(event.data);
      if (m.method === "Runtime.exceptionThrown")
        console.error(JSON.stringify(m.params));
      if (m.id) {
        const p = pending.get(m.id);
        if (!p) return;
        pending.delete(m.id);
        if (m.error) p.reject(new Error(m.error.message));
        else p.resolve(m.result);
      }
    });
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++sequence;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const r = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (r.exceptionDetails)
        throw new Error(JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    const wait = async (expression) => {
      for (let i = 0; i < 100; i++) {
        if (await evaluate(expression)) return;
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error(
        "Timeout: " +
          expression +
          " | " +
          (await evaluate(
            "location.href + (document.body?.innerText || '').slice(0, 2500)",
          )),
      );
    };
    const fill = async (id, value) =>
      evaluate(
        "(()=>{const e=document.getElementById(" +
          JSON.stringify(id) +
          ");e.value=" +
          JSON.stringify(value) +
          ';e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));})()',
      );
    const submit = () =>
      evaluate('document.querySelector(".conta-formulario").requestSubmit()');
    const click = (href) =>
      evaluate(
        "document.querySelector(" +
          JSON.stringify('a[href="' + href + '"]') +
          ").click()",
      );
    fs.mkdirSync(".vite/conta-qa", { recursive: true });
    const shot = async (name) => {
      const r = await send("Page.captureScreenshot", {
        captureBeyondViewport: true,
      });
      fs.writeFileSync(
        ".vite/conta-qa/" + name + ".png",
        Buffer.from(r.data, "base64"),
      );
    };
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Runtime.enable");
    await send("Page.enable");
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `const originalFetch = window.fetch.bind(window); window.fetch = (url, options) => String(url).startsWith('https://viacep.com.br/') ? Promise.resolve(new Response(JSON.stringify({localidade:'Joinville',uf:'SC',bairro:'Centro',logradouro:'Rua das Flores'}), {status:200,headers:{'Content-Type':'application/json'}})) : originalFetch(url, options);`,
    });
    console.log("HTTP", (await fetch("http://127.0.0.1:5178/entrar")).status);
    console.log(
      "Navigate",
      await send("Page.navigate", { url: "http://127.0.0.1:5178/entrar" }),
    );
    await wait('document.querySelector("h1")?.textContent === "Entrar"');
    await shot("login");
    await click("/cadastro");
    await wait('!!document.getElementById("confirmar")');
    await shot("cadastro");
    for (const [id, value] of Object.entries({
      nome: "Marina Costa",
      telefone: "(47) 99999-0000",
      email: "marina@example.com",
      senha: "SenhaTeste123",
      confirmar: "SenhaTeste123",
      endereco: "Rua das Flores, 120",
      cidade: "Joinville",
      uf: "SC",
      cep: "01234567",
    }))
      await fill(id, value);
    await wait('!document.querySelector(".conta-formulario button[type=submit]").disabled');
    await submit();
    await wait(
      'location.pathname === "/entrar" && !!document.getElementById("email")',
    );
    await fill("email", "marina@example.com");
    await fill("senha", "SenhaTeste123");
    await submit();
    await wait('!!document.querySelector(".conta-identidade")');
    await shot("minha-conta");
    assert.ok(
      (
        await evaluate('document.querySelector(".conta-detalhes").textContent')
      ).includes("01234-567"),
    );
    await click("/minha-conta/editar");
    await wait('document.getElementById("nome")?.value === "Marina Costa"');
    await shot("editar");
    await fill("telefone", "(47) 99999-0000");
    await fill("nome", "Marina Atualizada");
    await submit();
    await wait('!!document.querySelector(".conta-identidade")');
    assert.ok(
      (
        await evaluate(
          'document.querySelector("h2").textContent + document.querySelector(".conta-identidade").textContent',
        )
      ).includes("Marina Atualizada"),
    );
    await click("/minha-conta/senha");
    await wait('!!document.getElementById("senha_atual")');
    await shot("senha");
    await fill("senha_atual", "SenhaTeste123");
    await fill("senha", "NovaSenha123");
    await fill("confirmar", "NovaSenha123");
    await submit();
    await wait('!!document.querySelector(".conta-identidade")');
    const viewport = (width, height = 817) =>
      send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: true,
      });
    const semOverflow = async (width) =>
      assert.ok(
        await evaluate("document.documentElement.scrollWidth <= " + width),
        "Sem rolagem horizontal em " + width + "px",
      );
    await viewport(391);
    await send("Page.navigate", { url: "http://127.0.0.1:5178/minha-conta" });
    await wait('!!document.querySelector(".conta-mobile-cartao")');
    assert.equal(
      await evaluate(
        'getComputedStyle(document.querySelector(".conta-desktop-header")).display',
      ),
      "none",
    );
    assert.equal(
      await evaluate('document.querySelectorAll(".conta-mobile-nav a").length'),
      4,
    );
    await shot("mobile-conta");
    await semOverflow(391);
    await click("/minha-conta/editar");
    await wait(
      'document.getElementById("nome")?.value === "Marina Atualizada"',
    );
    await viewport(391, 1017);
    await shot("mobile-editar");
    await viewport(391);
    await semOverflow(391);
    assert.equal(
      await evaluate('document.getElementById("uf").tagName'),
      "SELECT",
    );
    await fill("nome", "Marina Mobile");
    await submit();
    await wait('!!document.querySelector(".conta-mobile-cartao")');
    assert.ok(
      (
        await evaluate(
          'document.querySelector(".conta-mobile-cartao").textContent',
        )
      ).includes("Marina Mobile"),
    );
    await evaluate(
      `document.querySelector('.conta-mobile-menu a[href="/meus-pedidos"]').click()`,
    );
    await wait(
      'location.pathname === "/meus-pedidos" && document.querySelector(".cliente-vazio")?.textContent.includes("Você ainda não tem pedidos")',
    );
    await evaluate(`document.querySelector('.conta-mobile-nav a[href="/minha-conta"]').click()`);
    await wait('!!document.querySelector(".conta-mobile-cartao")');
    await viewport(360);
    await semOverflow(360);
    await evaluate('document.querySelector(".conta-sair-mobile").click()');
    await wait(
      'location.pathname === "/entrar" && !!document.getElementById("email")',
    );
    await viewport(391, 771);
    await shot("mobile-login");
    await semOverflow(391);
    assert.ok(
      await evaluate(
        'getComputedStyle(document.querySelector(".conta-formulario")).backgroundColor === "rgba(0, 0, 0, 0)"',
      ),
    );
    await click("/cadastro");
    await wait('!!document.getElementById("confirmar")');
    await viewport(391, 1227);
    await shot("mobile-cadastro");
    await viewport(391);
    assert.ok(
      await evaluate(
        'document.getElementById("confirmar").getBoundingClientRect().top < document.getElementById("endereco").getBoundingClientRect().top',
      ),
    );
    for (const width of [360, 391, 680]) {
      await viewport(width);
      await semOverflow(width);
    }
    await viewport(391);
    for (const [id, value] of Object.entries({
      nome: "Cliente Mobile",
      email: "mobile@example.com",
      telefone: "47999990000",
      senha: "SenhaMobile123",
      confirmar: "SenhaMobile123",
      cep: "89200000",
    }))
      await fill(id, value);
    await wait(
      'document.getElementById("cidade").value === "Joinville" && !document.querySelector(".conta-formulario button[type=submit]").disabled',
    );
    assert.equal(await evaluate('document.getElementById("uf").value'), "SC");
    assert.equal(
      await evaluate('document.getElementById("endereco").value'),
      "Centro, Rua das Flores",
    );
    await evaluate(
      'document.querySelector("form .conta-acoes a").scrollIntoView({block:"end"})',
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.ok(
      await evaluate(
        'document.querySelector("form .conta-acoes a").getBoundingClientRect().bottom <= document.querySelector(".conta-mobile-nav").getBoundingClientRect().top',
      ),
      "Botões acessíveis acima da navegação",
    );
    await submit();
    await wait(
      'location.pathname === "/entrar" && !!document.getElementById("email")',
    );
    await fill("email", "mobile@example.com");
    await fill("senha", "SenhaMobile123");
    await submit();
    await wait('!!document.querySelector(".conta-mobile-cartao")');
    console.log(
      "Browser: desktop preservado; login, cadastro, conta, edição e CEP validados em mobile; navegação, pedidos e logout funcionais; sem overflow em 360, 391 e 680px.",
    );
  } finally {
    if (socket) {
      if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify({ id: 999999, method: "Browser.close" }));
      socket.close();
    }
    edge.kill();
    await vite.close();
    await new Promise((resolve) => api.close(resolve));
    // O perfil temporário fica fora do projeto; Edge pode manter arquivos abertos ao encerrar.
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
