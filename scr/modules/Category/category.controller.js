import slugify from "slugify";
import Category from "../../../DB/models/category.model.js";
import generateUniqueString from '../../Utlis/generate-uniqueStrin.js'
import cloudinaryConnection from '../../Utlis/cloudinary.js'
import subCategory from "../../../DB/models/sub-category.model.js";
import Brand from "../../../DB/models/brand.model.js";


export const addCategory = async (req, res, next) => {
      
    const{name}=req.body
    const{_id}=req.authuser

    const isnameduplicate=await Category.findOne({name})
    if(isnameduplicate){
        return next(new Error('name is already exist'))
    }

    const slug=slugify(name,'-')

    if(!req.file) return next(new Error('image is requried'))
    const folder_Id=generateUniqueString(5);
    const{secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:`${process.env.MAIN_FOLDER}/Categories/${folder_Id}`
    })

    const category = {
        name,
        slug,
        image: { public_id, secure_url },
        folder_Id,
        addedBy: _id

    }

    const newCategory = await Category.create(category)

    
  
    res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory })

   

}


export const updatedCategory = async (req, res, next) => {
    const{name,oldpublicId}=req.body
    const{_id}=req.authuser
    const{categoryId}=req.params

    const category=await Category.findById(categoryId)
    if(!category) return next(new Error("doesnt exist"));

    if(name){
        if(name==category.name){
            return next(new Error('changw name'))
        }
        const isnamedublicate=await Category.findOne({name})
        if(isnamedublicate) return next(new Error("name already exist"))
    }
    category.name=name
    category.slug=slugify(name,'-')
    

    if(oldpublicId)
    {
        if(!req.file)return next(new Error('photo should add'))

        const newpublicid=oldpublicId.split(`${category.folder_Id}/`)[1]
        const{secure_url}=cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.MAIN_FOLDER}/Categories/${category.folder_Id}`,
            public_id:newpublicid
        })
        category.image.secure_url = secure_url

    }


    category.updatedBy=_id
    await category.save()    
}


export const getAllCategories = async (req, res, next) => {

    const categories = await Category.find().populate([{
        path: 'subategories'

    }])
    res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories })

}


export const deleteCategory = async (req, res, next) => {

    const { categoryId } = req.params

    const category = await Category.findByIdAndDelete(categoryId)

    if (!category) return next({ cause: 404, message: 'category not found' })

    const subCategories = await subCategory.deleteMany({ categoryId })

    if (subCategories.deletedCount < 0) {
        console.log('there is no related subCategory');
    }

    const brand = await Brand.deleteMany({ categoryId })
    if (brand.deletedCount < 0) {
        console.log('there is no related category');
    }

    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${category.folder_Id}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${category.folder_Id}`)

    res.status(200).json({ success: true, message: 'category deleted successfully' })


}