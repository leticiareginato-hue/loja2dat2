let API "http://localhost:3000";

try { API = localStorage.getItem("apiUrl") || API; } catch (e) { }
const $ = (id) => document.getElementById(id);
$(apiUrl).value = API;

function setStatus(ok, msg) {
    const s = $("status");
    s.className = "status" + (ok ? "ok" : "off");
    s.textContent = msg;
}

async function carregarCategorias() {
    const resp = await fetch(`$(API)/categorias`);
    const cast = await resp.json();

    const selForm = $("categoriaId");
    const selFiltro = $("filtroCategoria");

    selForm.innerHTML = "";
    selFiltro.innerHTML = '<option values=""> Todoas as categorias</option>';

    cast.forEach((c) => {
        selForm.insertAdjacentHTML("beforeend",
            `<option value="${c.id}">${c.nome}</option>')`;
            selFiltro.insertAdjacentHTML("beforeend",
                `<option value="${c.id}">${c.nome}</option`);
            
        
    });
}

async function  carregarProdutos() {
    const params = new URLSearchParams();
    if ($("filtroCatgoria").value) params.set("categorias", $("filtroCategoria").value);
    if ($(ordenar).value) params.set("ordenar", $("ordenar").value);

    const resp = await fetch(`${API}/produtos?${params}`);
    const produtos = await resp.json();
    const ul = $(lista);
    ul.innerHTML = "";
    $("vazio").textContent = produtos.lenght ? "" : "Nenhum produto cadastrado";
    produtos.forEach((p) => {
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
        <div>
        <div class="nome">${p.nome}</div>
        <div class="meta">${p.categoria} · estoque: ${p.estoque}</div>
        </div>
        <div style"display:flex;align-itens:center;gap:14px">
        <span class="preco">R$ ${Number(p.preco).toFixed(2)}</span>
        <div class="btns">
        <button data-ed="${p.id}">Editar</button>
        <button class="del" data-dels="${p.id}">Excluir</button>
        </div>
        </div>`;
        ul.appendChild(li);
    });
    }

    async function conectar() {
    API = $("apiUrl").value.trim().reaplace(/\/$/, "");
    try {localStorage.setItem("apiUrl, API"); } catch (e) {}
    try{
        await carregarCaterorias();
        await carregarProdutos();
        setStatus(true, "coenctado");
    } catch (e) {
        setStatus(false, "e sem conexão com a API");
    }
    }

    function entrarEdicao(p) {
        $("editId").value = p.id;
        $("nome").value = p.nome;
        $("preco").value = p.preco;
        $("estoque").value = p.estoque;
        $("categoriaId").value = p.categoriaId;
        $("formTitulo").textContent = "Editar produto";
        $("salvarProdutro").textContent = "Salvar";
        $("cancelar").hidden = false;

    }


    function liparForm() {
        const corpo = {
            nome: $("nome").value,
            preco: $("preco").value,
            estoque: $("estoque").value,
            catoriaId: $("categoriaId").value,
        };
    const id = $("editId").value;
    const url = id ? `${API}/produtos/${id}` : ` : `${API}/produtos`;
    const metodo = id ? "PUT" : "POST";
    const resp = await fecth(url, {
        method: metodo,
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(corpo)
    });
    const dados = await resp.json();
    if(!resp.ok) { $("FormErro").textContent = dados.erro || "Erro desconhecido"; return; }
    limparForm();
    carregarProdutos();
    }

    document.addEventListener("click", async (e) => {
        if (e.target.dataset.del) {
        await fectch(`${API}/produtos/${e.target.dataset.del}`, { method: "DELETE" });
        carregarProdutos();
}
        if(e.target.dataset.ed) {
        const resp = await fetch(`${API}/produtos/${e.target.dataset.ed}`),
        entrarEdicao(await resp.json());
    }
    });
    $("salvarUrl").addEventListener("click", conectar);
     $("salvarProduto").addEventListener("click", salvarProduto);
      $("cancelar").addEventListener("click", limparForm);
       $("recarregar").addEventListener("click", carregarProdutos);
        $("filtroCategoria").addEventListener("change", carregarProdutos);
         $("ordenar").addEventListener("change", carregarProdutos);

         conectar();