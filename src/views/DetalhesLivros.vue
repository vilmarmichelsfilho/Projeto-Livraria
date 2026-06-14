<script setup>
import { useRoute, RouterLink } from 'vue-router';
import { produtos } from '@/data/produtos';
import { formataPreco } from '@/utils/produtosUtils';
import CartIcon from '@iconify-vue/mdi/cart';

const rota = useRoute();

const livro = produtos.find(p => p.endereco === rota.params.endereco);
</script>

<template>
    <div class="container" v-if="livro">
        <div class="info">
            <img :src="livro.capa" :alt="'Capa do Livro '+livro.titulo">
            <div>
                <h1>{{ livro.titulo }}</h1>
                <h3>{{ livro.autor }}</h3>
                <p>{{ livro.resenha }}</p>
                <h2>{{ formataPreco(livro.preco) }}</h2>
                <button><CartIcon width="2vw" />Adicionar ao carrinho</button>
                 <ul>
                <li>
                    <h2>Gênero</h2>
                    <p>{{ livro.genero }}</p>
                </li>
                <li>
                    <h2>Páginas</h2>
                    <p>{{ livro.paginas }}</p>
                </li>
            </ul>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    margin: 3rem;
}
.info {
    display: flex;
    gap: 3rem;
}
h1, h2, h3 {
    font-weight: bolder;
}
h2 {
    font-size: 2.5rem;
    opacity: 0.9;
}
h3 {
    opacity: 0.7;
    margin-bottom: 1rem;
}
p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
}
img {
    max-width: 400px;
}
button {
    color: white;
    background-color: #476978;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bolder;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    transition: 0.3s;
}
button:hover {
    transform: scale(1.1);
    color: black;
}
ul {
    list-style: none;
    display: flex;
    gap: 2rem;
    margin-top: 10rem;
    padding: 0;
}
ul li h2 {
    font-size: 1.2rem;
    cursor: default;
}
ul li p {
    font-size: 1rem;
    cursor: default;
}
ul li {
    background: rgba(71, 105, 120, 0.759);
    width: 90px;
    height: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
}
</style>