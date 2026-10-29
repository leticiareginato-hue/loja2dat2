const experess = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const ARQUIVO = "./dados.json";

app.use(experess.json());
app.use(experess.static("public"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Acess-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Acess-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

function carregar() {
    const texto = fs.readFileSync(ARQUIVO, "utf-8");
    return JSON.parse(texto);
}

function salvar(dados) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}
let { categorias, produtos } = carregar();
let proximoId = produtos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
function comCategorias(p) {
    const cat = categorias.find(c => c.id === p.categoriaId);
    return { ...p, categoria: cat ? cat.nome : "Sem categoria" };
}

app.get("/categorias", (req, res) => {
    res.status(200).json(categorias);
});

app.get("/produtos", (req, res) => {
    let lista = produtos.map(comCategorias);
    if (req.query.categoriaId) {
        const idCat = Number(req.query.categoria);
        lista = lista.filter((p) => p.categoriaId === idCat);
    }
    const ordenar = req.query.ordenar;
    if (ordenar ==="preco") lista.sort((a, b) => a.preco - b.preco);
    if (ordenar ==="estoque") lista.sort((a, b) => a.estoque - b.estoque);
    if (ordenar ==="nome") lista.sort((a, b) => a.nome.localeCompare(b.nome));

    res.status(200).json(lista);
});

app.get("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);
    const produto = produtos.find((p) => p.id === id);
    if(!produto) return res.status(404).json({ erro: "Produto não encontrado" });
    res.status(200).json(comCategorias(produto));
});

function validar(body){
    const nome = (body.nome || "").trim();
    const preco = Number(body.preco);
    const estoque = Number(body.estoque);
    const categoriaId = Number(body.categoriaId);
    
    if (!nome) return {erro: "Informe o nome"};
    if (Number.isNaN(preco) || preco < 0) return {erro: "Preco deve ser um número maior que zero"};
    if (Number.isNaN(estoque) || estoque < 0) return {erro: "Estoque deve ser um número maior que zero"};
    if (!categorias.find((c) => c.id === categoriaId)) return {erro: "categoriaId inexistente"};

    return { ok: true, nome, preco, estoque, categoriaId };
}