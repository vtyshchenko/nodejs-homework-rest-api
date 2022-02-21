const express = require('express')
const jois = require('joi');

const router = express.Router()

const contactsList = require("../../helpers/contacts");

// @ GET /api/contacts
//     ничего не получает
//     вызывает функцию listContacts для работы с json-файлом contacts.json
//     возвращает массив всех контактов в json-формате со статусом 200
router.get('/', async (req, res, next) => {
  const contacts = await contactsList.listContacts();
  console.table(contacts);
  res.json({ status: "accepted", status_code: 200, data: contacts })
})

// @ GET /api/contacts/:id
//     Не получает body
//     Получает параметр id
//     вызывает функцию getById для работы с json-файлом contacts.json
//     если такой id есть, возвращает объект контакта в json-формате со статусом 200
//     если такого id нет, возвращает json с ключом "message": "Not found" и статусом 404
router.get('/:contactId', async (req, res, next) => {
  const contact = await contactsList.getContactById(req.params.contactId);
  if (!contact) {
    res.json({ status: "rejected", status_code: 404, message: "Not found" })
  } else {
    res.json({ status: "accepted", status_code: 200, data: contact })
  }
})

// @ POST /api/contacts
//     Получает body в формате {name, email, phone} (все поля обязательны)
//     Если в body нет каких-то обязательных полей, возвращает json с ключом {"message": "missing required name field"} и статусом 400
//     Если с body все хорошо, добавляет уникальный идентификатор в объект контакта
//     Вызывает функцию addContact(body) для сохранения контакта в файле contacts.json
//     По результату работы функции возвращает объект с добавленным id {id, name, email, phone} и статусом 201
router.post('/', async (req, res, next) => {
  const { name, email, phone } = req.body

  let err = !name ? 'name,' : ''
  err += !email ? 'email,' : ''
  err += !phone ? 'phone' : ''
  err = err && err.slice(-1) === ',' ? err.slice(0, err.length - 1) : err

  if (err) {
    res.json({ status: "rejected", status_code: 400, message: `missing required ${err} field` })
  } else {
    try {
      const validate = await validateData({ name, email, phone });
      if (validate.res) {
        const addedContact = await contactsList.addContact(name, email, phone);
        if (!addedContact) {
          res.json({ status: "rejected", status_code: 410, message: "Error adding data" })
        } else {
          res.json({ status: "accepted", status_code: 201, data: addedContact })
        }
      } else {
        res.json({ status: "rejected", status_code: 409, message: `Wrong value of required fields: ${validate.error.message}` })
      }
    }
    catch (error) {
      res.json({ status: "rejected", status_code: 409, message: error.message })
    }
  }
})

// @ DELETE /api/contacts/:id
//     Не получает body
//     Получает параметр id
//     вызывает функцию removeContact для работы с json-файлом contacts.json
//     если такой id есть, возвращает json формата {"message": "contact deleted"} и статусом 200
//     если такого id нет, возвращает json с ключом "message": "Not found" и статусом 404
router.delete('/:contactId', async (req, res, next) => {
  const removedContact = await contactsList.removeContact(req.params.contactId);
  if (!removedContact) {
    res.json({ status: "rejected", status_code: 404, message: "Not found" })
  } else {
    res.json({ status: "accepted", status_code: 200, message: "contact deleted" })
  }
})

// @ PUT /api/contacts/:id
//     Получает параметр id
//     Получает body в json-формате c обновлением любых полей name, email и phone
//     Если body нет, возвращает json с ключом {"message": "missing fields"} и статусом 400
//     Если с body все хорошо, вызывает функцию updateContact(contactId, body) (напиши ее) для обновления контакта в файле contacts.json
//     По результату работы функции возвращает обновленный объект контакта и статусом 200. В противном случае, возвращает json с ключом "message": "Not found" и статусом 404
router.put('/:contactId', async (req, res, next) => {
  console.log(req.params.contactId);
  console.log(req.body);
  if (!req.body) {
    res.json({ status: "rejected", status_code: 400, message: "missing fields" })
  } else {
    const { name, email, phone } = req.body
    const validate = await validateData({ name, email, phone });

    if (validate.res) {
      const updatedContact = await contactsList.updateContact(req.params.contactId, name, email, phone);
      if (!updatedContact) {
        res.json({ status: "rejected", status_code: 404, message: "Not found" })
      } else {
        res.json({ status: "accepted", status_code: 200, data: updatedContact })
      }
    } else {
        res.json({ status: "rejected", status_code: 409, message: `Wrong value of required fields: ${validate.error.message}` })
      }
  }
})

async function validateData({ name, email, phone }) {
  const schema = jois.object({
    name: jois.string()
      .min(3)
      .max(35)
      .required()
    ,
    email: jois.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ua'] } }).required()
    ,
    phone: jois.string().pattern(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "number"
    )
      .required()
  })
  try {
    const validate = await schema.validateAsync({ name, email, phone });
    console.log('validate', validate);
    return { res: true, error: '' };
  }
  catch (error) {
    return { res: false, error };
  }
}

module.exports = router
