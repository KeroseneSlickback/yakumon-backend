const Store = require('../models/store_model')
const sharp = require('sharp')

exports.store_create = async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 500, height: 500 }).png().toBuffer()
  // issue with picture in the new Store body? 
  const store = new Store({
    ...req.body,
    picture: buffer,
    owner: req.user._id,
  })
  try {
    await store.save();
    res.status(201).send(store)
  } catch (e) {
    res.status(400).send(e)
  }
}

exports.store_get = async (req, res) => {
  try {
    Store.find()
      .exec(function (err, stores) {
        if (err) throw new Error()
        res.send(stores)
      })
  } catch (e) {
    res.status(500).send(e)
  }
}

exports.store_get_single = async (req, res) => {
  const _id = req.params.id;
  try {
    const store = await Store.findOne({_id})
      .populate('employees')
    if (!store) {
      return res.status(404).send()
    }
    res.send(store)
  } catch (e) {
    res.status(400).send(e)
  }
}

exports.store_patch = async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 500, height: 500 }).png().toBuffer()
  const updates = Object.keys(req.body)
  const allowedUpdates = ['storeName', 'storeType', 'storeDescription', 'location', 'locationLink', 'hours', 'picture']
  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update)
  })
  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }
  try {
    const store = await Store.findOne({_id: req.params.id, owner: req.user._id})
    if (!store) {
      return res.status(404).send()
    }
    updates.forEach(update => {
      store[update] = req.body[update]
    })
    store.picture = buffer
    await store.save()
    res.send(store)
  } catch (e) {
    res.status(400).send(e)
  }
}

exports.store_delete = async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({_id: req.params.id, owner: req.user._id})
    if (!store) {
      return res.status(404).send()
    }
    res.status(200).send()
  } catch (e) {
    res.status(500).send()
  }
} 