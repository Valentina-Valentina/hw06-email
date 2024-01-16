import express from "express";
import contactsController from "../../controllers/contacts-controller.js";
import { isEmptyBody, isValidId, authenticate } from "../../middlewares/index.js";
import { validateBody } from "../../decorators/index.js"
import { contactAddSchema, contactUpdateSchema, contactUpdateFavoriteSchema } from "../../models/Contact.js";


const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get('/', contactsController.getAll);

contactsRouter.get('/:contactId', contactsController.getById);

contactsRouter.post('/', validateBody(contactAddSchema), contactsController.add)

contactsRouter.delete('/:contactId', contactsController.deleteById)

contactsRouter.put('/:contactId', isEmptyBody, validateBody(contactUpdateSchema), contactsController.updateById)

contactsRouter.patch("/:contactId/favorite", isValidId, validateBody(contactUpdateFavoriteSchema), contactsController.updateById);

export default contactsRouter;
