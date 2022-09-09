const express = require('express')

const router = express.Router()

const contactsList = require("../../helpers/contacts");
const { schema } = require('../../routes/api/schemes')
const {validateData} = require('../../middlewares/validation')

router.get('/', async (req, res, next) => {
  const contacts = await contactsList.listContacts();
  console.table(contacts);
  return res.status(200).json({ status: "accepted", code: 200, data: contacts })
})

router.get('/:contactId', async (req, res, next) => {
  const contact = await contactsList.getContactById(req.params.contactId);
  if (!contact) {
    return res.status(404).json({ status: "rejected", code: 404, message: "Not found" })
  }
  return res.status(200).json({ status: "accepted", code: 200, data: contact })
  
})

router.post('/', validateData(schema), async (req, res, next) => {
  const { name, email, phone } = req.body

  if (!name || !email || !phone) {
    return res.status(400).json({ status: "rejected", code: 400, message: 'missing required field' })
  }
  try {
    const addedContact = await contactsList.addContact(name, email, phone);
    if (!addedContact) {
      return res.status(410).json({status: "rejected", code: 410, message: "Error adding data"})
    }
    return res.status(201).json({ status: "accepted", code: 201, data: addedContact })
  }
  catch (error) {
    return res.status(411).json({ status: "rejected", code: 411, message: error })
  }
})

router.delete('/:contactId', async (req, res, next) => {
  const removedContact = await contactsList.removeContact(req.params.contactId);
  if (!removedContact) {
    return  res.status(404).json({ status: "rejected", code: 404, message: "Not found" })
  }
  return res.status(200).json({ status: "accepted", code: 200, message: "contact deleted" })
  
})

router.put('/:contactId', validateData(schema), async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ status: "rejected", code: 400, message: "missing fields" })
  }
  const { name, email, phone } = req.body
  const updatedContact = await contactsList.updateContact(req.params.contactId, name, email, phone);
  if (!updatedContact) {
    return res.status(404).json({ status: "rejected", code: 404, message: "Not found" })
  }
  return res.status(200).json({ status: "accepted", code: 200, data: updatedContact })
})

module.exports = router
