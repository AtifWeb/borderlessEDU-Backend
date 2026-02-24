export class MongoService {
  // Find one document by filter
  static async findOne(model, filter = {}, projection = null, options = {}) {
    return model.findOne(filter, projection, options);
  }

  // Find multiple documents
  static async find(model, filter = {}, projection = null, options = {}) {
    return model.find(filter, projection, options);
  }

  // Find by ID
  static async findById(model, id, projection = null) {
    return model.findById(id, projection);
  }

  // Create a new document
  static async create(model, data) {
    return model.create(data);
  }

  // Update document by ID
  static async updateById(model, id, data, options = { new: true }) {
    return model.findByIdAndUpdate(id, data, options);
  }

  // Delete document by ID
  static async deleteById(model, id) {
    return model.findByIdAndDelete(id);
  }

  // Delete one document by filter
  static async deleteOne(model, filter = {}) {
    return model.deleteOne(filter);
  }

  // Update one document by filter
  static async updateOne(model, filter, data, options = {}) {
    return model.updateOne(filter, data, options);
  }

  // Count documents matching filter
  static async count(model, filter = {}) {
    return model.countDocuments(filter);
  }

  // Soft delete by ID (sets `deleted: true`)
  static async softDeleteById(model, id) {
    return model.findByIdAndUpdate(id, { deleted: true }, { new: true });
  }

  // Find and populate fields with select options
  static async findOneWithPopulate(model, filter = {}, populateFields) {
    let query = model.findOne(filter);
    if (Array.isArray(populateFields)) {
      query = query.populate(populateFields);
    } else {
      query = query.populate(populateFields);
    }
    return query;
  }

  static async findWithPopulate(model, filter = {}, populateFields) {
    let query = model.find(filter);
    if (Array.isArray(populateFields)) {
      query = query.populate(populateFields);
    } else {
      query = query.populate(populateFields);
    }
    return query;
  }

  // Find and populate with select options
  static async findWithPopulateSelect(model, filter = {}, populateConfig) {
    let query = model.find(filter);
    if (Array.isArray(populateConfig)) {
      populateConfig.forEach((config) => {
        if (typeof config === "string") {
          query = query.populate(config);
        } else {
          query = query.populate(config);
        }
      });
    }
    return query;
  }

  // Upsert (update or insert)
  static async upsert(
    model,
    filter,
    data,
    options = { new: true, upsert: true },
  ) {
    return model.findOneAndUpdate(filter, data, options);
  }
}
