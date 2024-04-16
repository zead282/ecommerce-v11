import subCategory from "../../../DB/models/sub-category.model.js";
import Category from "../../../DB/models/category.model.js";
import slugify from "slugify";
import cloudinaryConnection from "../../Utlis/cloudinary.js";
import generateUniqueString from "../../Utlis/generate-uniqueStrin.js";

export const addSubCategory = async (req, res, next) => {

    // 1- destructuring the request body

    const { name } = req.body
    const { _id } = req.authUser
    const { categoryId } = req.params
    // 2- check if the subcategory name is already exist
    const isNameDuplicate = await subCategory.findOne({ name })
    if (isNameDuplicate) {
        return next(new Error('name is alrady exists,Please try another name', { cause: 409 }))
    }
    // 3- generate the slug
    const category = await Category.findById(categoryId)

    if (!category) {
        return next(new Error('name is not exists,Please try another name', { cause: 409 }))
    }

    const slug = slugify(name, '-')

    // 4- upload image to cloudinary

    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folder_Id = generateUniqueString(5)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folder_Id}/subCategory/${folder_Id}`
    })


    const SubCategory = {
        name,
        slug,
        image: { public_id, secure_url },
        folder_Id,
        addedBy: _id,
        categoryId
    }

    const newSubCategory = await subCategory.create(SubCategory)
    res.status(201).json({ success: true, message: 'Category created successfully', data: newSubCategory })

}

export const updatedSubCategory = async (req, res, next) => {

    // 1- data from destructuring the request body 
    const { name, oldPublicId } = req.body
    //2 check autherization
    const { _id } = req.authUser
    const { subCategoryId } = req.params
    //check is categoryId is exists
    const isSubCategoryExists = await subCategory.findById(subCategoryId).populate('categoryId')
    if (!isSubCategoryExists) return next({ cause: 404, message: 'Category not found' })

    if (name) {
        // check if the new category name different from the old name
        if (name == isSubCategoryExists.name) {
            return next({ cause: 400, message: 'Please enter different category name from the existing one.' })
        }

        //  check if the new category name is already exist
        const isNameDuplicated = await subCategory.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Category name is already exist' })
        }

        //  update the category name and the category slug
        isSubCategoryExists.name = name
        isSubCategoryExists.slug = slugify(name, '-')
    }


    //  check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${isSubCategoryExists.folder_Id}/`)[1]
      

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder:`${process.env.MAIN_FOLDER}/Categories/${isSubCategoryExists.categoryId.folder_Id}/subCategory/${isSubCategoryExists.folder_Id}`,
        
            public_id: newPulicId
        })
       
        isSubCategoryExists.image.secure_url = secure_url
   
    }


    //  set value for the updatedBy field
    isSubCategoryExists.updatedBy = _id

    await isSubCategoryExists.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: isSubCategoryExists })
}


