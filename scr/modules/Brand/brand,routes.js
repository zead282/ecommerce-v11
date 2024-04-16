import { Router } from "express";
import * as brandController from "./brand.controller.js"
import { auth } from "../../middlewares/auth.middlewares.js";
import { endPointsRoles } from "../Brand/brand.endpoint.js";
import {multerMiddleHost}from "../../middlewares/multer.middlewares.js";
import {allowedExtensions} from "../../Utlis/allowed-extensions.js"
import expressAsyncHandler from "express-async-handler";

const router = Router()

router.post('/',auth(endPointsRoles.ADD_BRAND),multerMiddleHost({
    extensions: allowedExtensions.image
}).single('image'),
expressAsyncHandler(brandController.addBrand))






export default router