const Appointment = require('../models/appointment_model')
const Service = require('../models/service_model')

exports.service_create = async (req, res) => {
  const service = new Service({
    ...req.body,
    owner: req.user._id
  })
  try {
    await service.save()
    res.status(201).send(service)
  } catch (e) {
    res.status(400).send(e)
  }
}

exports.service_read = async (req, res) => {
  const _id = req.params.id;
  try {
    // Questionable
    const service = await Service.findOne({_id, owner: req.user._id})
    if (!service) {
      return res.status(404).send()
    }
    res.send(service)
  } catch (e) {
    res.status(400).send()
  }
}

exports.service_patch = async (req, res) => {
  const updates = Object.keys(req.body);
	const allowedUpdates = ['serviceName', 'timeSpand', 'price'];
	const isValidOperation = updates.every(update => {
		return allowedUpdates.includes(update);
	});
	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}
	try {
		const service = await Service.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!service) {
			return res.status(404).send();
		}
		updates.forEach(update => {
			service[update] = req.body[update];
		});
		await service.save();
		res.send(service);
	} catch (e) {
		res.status(400).send(e);
	}
}

exports.service_delete = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    })
    if (!service) {
      return res.status(404).send()
    }
    // delete appointments with same service?
    // await Appointment.deleteMany({service: req.params.id})
    res.status(200).send()
  } catch (e) {
    res.status(500).send()
  }
}