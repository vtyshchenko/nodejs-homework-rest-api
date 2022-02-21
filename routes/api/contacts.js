const express = require('express')
const jois = require('joi');

const router = express.Router()

const contactsList = require("../../helpers/contacts");

router.get('/', async (req, res, next) => {
  const contacts = await contactsList.listContacts();
  console.table(contacts);
  res.json({ status: "accepted", status_code: 200, data: contacts })
})

router.get('/:contactId', async (req, res, next) => {
  const contact = await contactsList.getContactById(req.params.contactId);
  if (!contact) {
    res.json({ status: "rejected", status_code: 404, message: "Not found" })
  } else {
    res.json({ status: "accepted", status_code: 200, data: contact })
  }
})

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

router.delete('/:contactId', async (req, res, next) => {
  const removedContact = await contactsList.removeContact(req.params.contactId);
  if (!removedContact) {
    res.json({ status: "rejected", status_code: 404, message: "Not found" })
  } else {
    res.json({ status: "accepted", status_code: 200, message: "contact deleted" })
  }
})

router.put('/:contactId', async (req, res, next) => {
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
    await schema.validateAsync({ name, email, phone });
    return { res: true, error: '' };
  }
  catch (error) {
    return { res: false, error };
  }
}

module.exports = router
