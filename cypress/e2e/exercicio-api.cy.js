/// <reference types="cypress" />
import { equal } from 'joi';
import contrato from '../contracts/usuarios.contract';
const { faker } = require('@faker-js/faker'); 

const nome = faker.internet.userName(); 
const email = faker.internet.email(); 
const senha = faker.internet.password(); 
const administrador = "true"; 


describe("Testes da Funcionalidade Usuários", () => {
  let token
  before(() => {
         cy.token('beltrano@qa.com.br', 'teste').then(tkn => {token = tkn})
  });

  it("Deve validar contrato de usuários", () => {
     cy.request('usuarios').then(response => {
          return contrato.validateAsync(response.body)
      })
  });

  it("Deve listar usuários cadastrados", () => {
     cy.request({
          method: 'GET',
          url: 'usuarios'
     }).then((response) =>{        
        expect(response.status).to.equal(200)
        expect(response.body.usuarios[1].nome).to.equal('Faust Silva EDITADO');
     })
  });

  it("Deve cadastrar um usuário com sucesso", () => {
     cy.request({
          method: 'POST',
          url: 'usuarios',
          headers: {authorization: token}, 
          body: {
          "nome": nome,
          "email": email,
          "password": senha,
          "administrador": administrador
        },
     }).then((response) =>{
       expect(response.status).to.equal(201)
       expect(response.body.message).to.equal('Cadastro realizado com sucesso')

    })
  });

  it("Deve validar um usuário com email inválido", () => {
     cy.cadastrarUsuario(token, nome, "talyteste@qa.com.br", senha, administrador)

     .then((response) =>{
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Este email já está sendo usado')
   })
  });

  it("Deve editar um usuário previamente cadastrado", () => {
   cy.request('usuarios').then(response => {
      let id = response.body.usuarios[0]._id
     cy.request({
      method: 'PUT',
      url: `usuarios/${id}`,
      headers: {authorization: token}, 
      body: {
      "nome": "Gunnar.Ortiz EDITADO",
      "email": "Kira66@gmail.com",
      "password": "teste",
      "administrador": "true"
      }
     }).then((response) =>{
      expect(response.status).to.equal(200)
      expect(response.body.message).to.equal('Registro alterado com sucesso')
     })
  });
});

it("Deve deletar um usuário previamente cadastrado", () => {
   let usuarios = `Faust Silva ${Math.floor(Math.random() * 100000000)}`;
   cy.cadastrarUsuario(token, nome, "talyteste@qa.com.br", senha, administrador).then(response => {
       let id = response.body._id;

       cy.request({
           method: 'DELETE',
           url: `usuarios/${id}`,
           headers: { authorization: token }
       }).then(response => {
           expect(response.status).to.equal(200);
         })
      })
     });
   });