const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const contactsRouter = require('./routes/api/contacts')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app

// @ GET /api/contacts
//     ничего не получает
//     вызывает функцию listContacts для работы с json-файлом contacts.json
//     возвращает массив всех контактов в json-формате со статусом 200

// @ GET /api/contacts/:id
//     Не получает body
//     Получает параметр id
//     вызывает функцию getById для работы с json-файлом contacts.json
//     если такой id есть, возвращает объект контакта в json-формате со статусом 200
//     если такого id нет, возвращает json с ключом "message": "Not found" и статусом 404

// @ POST /api/contacts
//     Получает body в формате {name, email, phone} (все поля обязательны)
//     Если в body нет каких-то обязательных полей, возвращает json с ключом {"message": "missing required name field"} и статусом 400
//     Если с body все хорошо, добавляет уникальный идентификатор в объект контакта
//     Вызывает функцию addContact(body) для сохранения контакта в файле contacts.json
//     По результату работы функции возвращает объект с добавленным id {id, name, email, phone} и статусом 201

// @ DELETE /api/contacts/:id
//     Не получает body
//     Получает параметр id
//     вызывает функцию removeContact для работы с json-файлом contacts.json
//     если такой id есть, возвращает json формата {"message": "contact deleted"} и статусом 200
//     если такого id нет, возвращает json с ключом "message": "Not found" и статусом 404

// @ PUT /api/contacts/:id
//     Получает параметр id
//     Получает body в json-формате c обновлением любых полей name, email и phone
//     Если body нет, возвращает json с ключом {"message": "missing fields"} и статусом 400
//     Если с body все хорошо, вызывает функцию updateContact(contactId, body) (напиши ее) для обновления контакта в файле contacts.json
//     По результату работы функции возвращает обновленный объект контакта и статусом 200. В противном случае, возвращает json с ключом "message": "Not found" и статусом 404
