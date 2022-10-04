# Yakumon Backend

The accompanied frontend can be found here: https://github.com/KeroseneSlickback/yakumon-frontend#readme

---

The Yakumon backend offers full-fledged CRUD functionality.

## Technologies

- Node/Express
- Mongoose/MongoDB
- Passport-JWT
- BcryptJS
- Express-Validator/Validator
- Helmet
- Dotenv
- Date-Fns
- Morgan
- Sharp

### Features

- User create/read/update/delete
- Appointment create/read/update/delete
- Time slot create/read/delete
- Store create/read/update/delete

### Challenges Faced

Appointment and time slot creation called for proper intergration with the frontend. Each appointment is made up of basic infomation data with associated array of time slots. Each timeslot is based on a 30min period, and are created from the start of the chosen schedule time and given service time slot amount.

Images are saved to the database as buffers after being sanitized, cropped, and compressed.
