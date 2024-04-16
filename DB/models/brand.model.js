/* import { Schema,model } from "mongoose";


const brandSchema = new Schema({

   
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    },
    folder_Id: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    subCategoryId: { type: Schema.Types.ObjectId, ref: "subCategory"},
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },



},{
    timestamps: true
})

const Brand = model('Brand', brandSchema)
export default Brand
 */