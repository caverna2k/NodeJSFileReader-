console.log('ini');
import Cidade from './cidade.js';
import Estado from './estado.js';
import { promises as fs } from 'fs';

let cidadesRaw = [];
let estadosRaw = [];

let cidades = [];
let estados = [];

init();

async function init() {
  await fs.readFile('Cidades.json').then((dataCidades) => {
    cidadesRaw = JSON.parse(dataCidades);
  });

  await fs.readFile('Estados.json').then((dataEstados) => {
    estadosRaw = JSON.parse(dataEstados);
  });

  await criarArrayTodasCidades();
  await criarArquivosDeEstado();
  await carregarListaEstadosComCidades();

  await contarCidadesPorEstado('PR');
  await listarTop5EstadosMaisCidades();
  await listarTop5EstadosMenosCidades();
  await listarCidadesComMaiorNome();
  await listarCidadesComMenorNome();
  await listarCidadesComMaiorNomeDeTodas();
  await listarCidadesComMenorNomeDeTodas();
}

async function listarTop5EstadosMaisCidades() {
  let stats = estados

    .sort((a, b) => a.cidades.length - b.cidades.length)
    .slice(-5)
    .reverse()

    .map((obj) => obj.nome + '-' + obj.cidades.length);

  console.log(`Estados com mais cidades ${stats}`);
}

async function listarTop5EstadosMenosCidades() {
  let stats = estados
    .sort((a, b) => a.cidades.length - b.cidades.length)
    .slice(0, 5)
    .reverse()
    .map((obj) => obj.nome + '-' + obj.cidades.length);

  console.log(`Estados com menos cidades ${stats}`);
}

async function listarCidadesComMaiorNome() {
  let stats = estados.sort(orderEstado).map((estado) =>
    estado.cidades
      .sort(ordemBasica)
      .reverse()
      .slice(0, 1)
      .map(
        (cidade) =>
          '\n' +
          cidade.nome +
          '(' +
          cidade.nome.length +
          ')' +
          '-' +
          estado.sigla
      )
  );

  console.log(`Cidades com maior nome ${stats}`);
}

async function listarCidadesComMenorNome() {
  let stats = estados.sort(orderEstado).map((estado) =>
    estado.cidades
      .sort(ordemBasicaDown)
      .slice(0, 1)
      .map(
        (cidade) =>
          '\n' +
          cidade.nome +
          '(' +
          cidade.nome.length +
          ')' +
          '-' +
          estado.sigla
      )
  );

  console.log(`Cidades com menor nome ${stats}`);
}

async function listarCidadesComMaiorNomeDeTodas() {
  let arrCities = [];

  estados.map((estado) =>
    estado.cidades
      .sort(ordemBasica)
      .reverse()
      .slice(0, 1)
      .map((cidade) => arrCities.push(cidade))
  );

  let arr = arrCities.sort(ordemBasica).reverse().slice(0, 1)[0];

  var estado = estados.find((estado) => estado.id === arr.estado);

  console.log(
    `Cidade com maior nome de todas ${arr.nome}(${arr.nome.length}) - ${estado.sigla}`
  );
}

async function listarCidadesComMenorNomeDeTodas() {
  let arrCities = [];

  estados.map((estado) =>
    estado.cidades
      .sort(ordemBasica)
      .slice(0, 1)
      .map((cidade) => arrCities.push(cidade))
  );

  let arr = arrCities.sort(ordemBasica).slice(0, 1)[0];

  var estado = estados.find((estado) => estado.id === arr.estado);

  console.log(
    `Cidade com menor nome de todas ${arr.nome}(${arr.nome.length}) - ${estado.sigla}`
  );
}

async function contarCidadesPorEstado(siglaEstado) {
  await fs
    .readFile('./estados/' + siglaEstado + '.json', 'utf-8')
    .then((res) => {
      res = JSON.parse(res);
      console.log(`O estado ${res.nome} tem ${res.cidades.length} cidades`);
    });
}

async function carregarListaEstadosComCidades() {
  try {
    var filenames = await fs.readdir('./estados/');
    await readFolderFiles(filenames);
  } catch (error) {}
}

async function readFolderFiles(filenames) {
  for (let filename of filenames) {
    await read('./estados/', filename);
  }
}

async function read(dirname, filenamne) {
  await fs.readFile(dirname + filenamne, 'utf-8').then((res) => {
    var estado = JSON.parse(res);
    estados.push(estado);
  });
}

function criarArrayTodasCidades() {
  for (let i = 0; i < cidadesRaw.length; i++) {
    try {
      var cidade = new Cidade(
        cidadesRaw[i].ID,
        cidadesRaw[i].Nome,
        cidadesRaw[i].Estado
      );
      cidades.push(cidade);
    } catch (error) {
      console.log(error);
    }
  }
}

async function criarArquivosDeEstado() {
  for (let i = 0; i < estadosRaw.length; i++) {
    try {
      const newFile = './estados/' + estadosRaw[i].Sigla + '.json';
      var cidadesPorEstado = cidades
        .filter((cidade) => cidade.estado === estadosRaw[i].ID)
        .sort();
      var estado = new Estado(
        estadosRaw[i].ID,
        estadosRaw[i].Sigla,
        estadosRaw[i].Nome,
        cidadesPorEstado
      );

      var estadoJson = JSON.stringify(estado);
      await fs.writeFile(newFile, '');
      await fs.appendFile(newFile, estadoJson);
    } catch (error) {
      console.log(error);
    }
  }
}

function ordemBasica(a, b) {
  if (a.nome.length === b.nome.length) {
    return ('' + b.nome).localeCompare(a.nome);
  }
  return a.nome.length - b.nome.length;
}

function ordemBasicaDown(a, b) {
  if (a.nome.length === b.nome.length) {
    return ('' + a.nome).localeCompare(b.nome);
  }
  return a.nome.length - b.nome.length;
}

function orderEstado(a, b) {
  return ('' + a.sigla).localeCompare(b.sigla);
}
