// Puxando as ferramentas do Firebase direto da internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmI6XLcLe7UtFPymgMt6b86CdB8azAuIU",
  authDomain: "meu-backlog.firebaseapp.com",
  projectId: "meu-backlog",
  storageBucket: "meu-backlog.firebasestorage.app",
  messagingSenderId: "792938542990",
  appId: "1:792938542990:web:a35be1345888c934ce16df",
  measurementId: "G-MVRDCT0E6G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const telaLogin = document.getElementById('tela-login');
const appPrincipal = document.getElementById('app-principal');
const emailLogin = document.getElementById('emailLogin');
const senhaLogin = document.getElementById('senhaLogin');
const botaoEntrar = document.getElementById('botaoEntrar');
const botaoSair = document.getElementById('botaoSair');
const mensagemErro = document.getElementById('mensagemErro');

const inputAtividade = document.getElementById('inputAtividade');
const inputLinguagem = document.getElementById('inputLinguagem');
const inputObservacoes = document.getElementById('inputObservacoes');
const botaoSalvar = document.getElementById('saveButton');
const listaIdeias = document.getElementById('lista-ideias');

let usuarioAtual = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioAtual = user;
        telaLogin.classList.add('escondido');
        appPrincipal.classList.remove('escondido');
        carregarIdeias(); 
    } else {
        usuarioAtual = null;
        telaLogin.classList.remove('escondido');
        appPrincipal.classList.add('escondido');
    }
});

botaoEntrar.addEventListener('click', async () => {
    try {
        await signInWithEmailAndPassword(auth, emailLogin.value, senhaLogin.value);
        mensagemErro.classList.add('escondido');
        emailLogin.value = "";
        senhaLogin.value = "";
    } catch (erro) {
        mensagemErro.classList.remove('escondido');
    }
});

botaoSair.addEventListener('click', () => signOut(auth));

botaoSalvar.addEventListener('click', async () => {
    if (inputAtividade.value !== "") {
        await addDoc(collection(db, "ideias"), {
            uid: usuarioAtual.uid,
            atividade: inputAtividade.value,
            linguagem: inputLinguagem.value,
            observacoes: inputObservacoes.value,
            status: "nao-comecado",
            dataCriacao: Date.now()
        });

        inputAtividade.value = "";
        inputLinguagem.value = "";
        inputObservacoes.value = "";
    }
});

// 3. LENDO AS IDEIAS E APAGANDO
function carregarIdeias() {
    const consulta = query(collection(db, "ideias"), where("uid", "==", usuarioAtual.uid));
    
    onSnapshot(consulta, (resultado) => {
        listaIdeias.innerHTML = ""; 

        resultado.forEach((documento) => {
            const ideia = documento.data();
            const idBanco = documento.id;

            const cartaoIdeia = document.createElement('div');
            cartaoIdeia.classList.add('cartao-ideia');

            cartaoIdeia.innerHTML = `
                <h3>💡 ${ideia.atividade}</h3>
                <p><strong>Linguagem:</strong> ${ideia.linguagem}</p>
                <p><strong>Observações:</strong> ${ideia.observacoes}</p>
                
                <div class="status-area" style="margin-top: 10px;">
                    <label>Status: </label>
                    <select class="status-select">
                        <option value="nao-comecado" ${ideia.status === 'nao-comecado' ? 'selected' : ''}>🔴 Não começado</option>
                        <option value="fazendo" ${ideia.status === 'fazendo' ? 'selected' : ''}>🟡 Em andamento</option>
                        <option value="concluido" ${ideia.status === 'concluido' ? 'selected' : ''}>🟢 Concluído</option>
                    </select>
                </div>
                
                <button class="btn-apagar">🗑️ Apagar</button>
            `;

            cartaoIdeia.querySelector('.btn-apagar').addEventListener('click', async () => {
                await deleteDoc(doc(db, "ideias", idBanco));
            });

            cartaoIdeia.querySelector('.status-select').addEventListener('change', async (evento) => {
                await updateDoc(doc(db, "ideias", idBanco), { status: evento.target.value });
            });

            listaIdeias.appendChild(cartaoIdeia);
        });
    });
}