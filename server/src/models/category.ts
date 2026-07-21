import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes go after schema definition
CategorySchema.index({ slug: 1 }, { unique: true });

// Export pattern — use existing model or create new one
const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema, "categories");

export default Category;