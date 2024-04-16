
import slugify from "slugify";
import Brand from "../../../DB/models/brand.model.js";
import subCategory from "../../../DB/models/sub-category.model.js";
import cloudinaryConnection from "../../Utlis/cloudinary.js";
import generateUniqueString from "../../Utlis/generate-uniqueStrin.js";




export const addBrand = async (req, res, next) => {
    const { name } = req.body
    const { _id } = req.authUser
    const { categoryId, subCategoryId } = req.query

    const subCategoryCheck = await subCategory.findById(subCategoryId).populate('categoryId', 'folder_Id')
    if (!subCategoryCheck) return next({ message: 'subcategory is note found', cause: 404 })

    const isBrandExist = await Brand.findOne({ name, subCategoryId })
    if (isBrandExist) return next({ message: 'brand is alrady exists from this subCategory', cause: 404 })

    if (categoryId != subCategoryCheck.categoryId._id) return next({ message: 'category is not found', cause: 404 })

    const slug = slugify(name, '-')

    if (!req.file) return next({ message: 'please uplode brand logo', cause: 404 })

    const folderID = generateUniqueString(5)

    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folder_Id}/subCategory/${subCategoryCheck.folder_Id}/brand ${folderID}`
    })

    const subCategoryObject = {
        name,
        slug,
        image: { public_id, secure_url },
        folder_Id: folderID,
        addedBy: _id,
        subCategoryId,
        categoryId
    }

    const newBrand = await Brand.create(subCategoryObject)
    res.status(201).json({
        status: 'success',
        message: 'brand addedd successfuly',
        data: newBrand
    })
}
