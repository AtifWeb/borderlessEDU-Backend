import { StudentDocuments } from "../../schemas/student/documents.js";
import { Student } from "../../schemas/student/student.js";
import { StudentDocumentsJoi } from "../../validation/student/documents.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

export class DocumentsController {
  // Create documents collection for student or append if exists
  async createOrAppend(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);

      // ensure body exists (multipart requests without multer may leave it undefined)
      req.body = req.body || {};

      // If files were uploaded via multipart (multer), map them to URLs and names
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // prefer S3 `location` (multer-s3), fallback to `path` or `filename`
        const fileUrls = req.files.map(
          (f) => f.location || f.path || f.filename || "",
        );
        const fileNames = req.files.map((f) => f.originalname || f.name || "");
        // set values so Joi validation and controller logic can consume them
        req.body.files = fileUrls;
        req.body.fileNames = JSON.stringify(fileNames);
      }

      // allow server to set created_by from token
      req.body.created_by = req.user.id;

      const { error, value } = StudentDocumentsJoi.createSchema().validate(
        req.body,
      );
      if (error) return Response.error(res, error.details[0].message, 400);

      const student = await MongoService.findById(Student, value.created_by);
      if (!student) return Response.error(res, "Student not found", 404);

      // If already has documents collection, append files and update main_file
      let doc = await MongoService.findOne(StudentDocuments, {
        student: value.created_by,
      });

      if (doc) {
        // If frontend provided file names in req.body.fileNames (array or stringified JSON), normalize them
        const providedNames = (() => {
          const val = req.body?.fileNames;
          if (!val) return [];
          if (Array.isArray(val)) return val;
          try {
            return JSON.parse(val);
          } catch (e) {
            return [];
          }
        })();

        const filesToAdd = (value.files || []).map((u, idx) => ({
          url: u,
          name: providedNames[idx] || "",
        }));
        if (filesToAdd.length > 0) {
          doc = await MongoService.updateById(
            StudentDocuments,
            doc._id,
            { $push: { files: { $each: filesToAdd } } },
            { new: true },
          );
        }
        if (value.main_file) {
          doc = await MongoService.updateById(
            StudentDocuments,
            doc._id,
            { main_file: value.main_file },
            { new: true },
          );
        }
      } else {
        const providedNames = (() => {
          const val = req.body?.fileNames;
          if (!val) return [];
          if (Array.isArray(val)) return val;
          try {
            return JSON.parse(val);
          } catch (e) {
            return [];
          }
        })();

        const createPayload = {
          student: value.created_by,
          files: (value.files || []).map((u, idx) => ({
            url: u,
            name: providedNames[idx] || "",
          })),
          main_file: value.main_file || "",
        };
        doc = await MongoService.create(StudentDocuments, createPayload);
      }

      Response.success(res, "Documents saved", { documents: doc });
    } catch (err) {
      console.error("CreateOrAppend Documents Error:", err);
      Response.error(res, "Failed to save documents", 500);
    }
  }

  // Add more files to an existing documents collection by doc id
  async addFiles(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { id } = req.params;

      const { error, value } = StudentDocumentsJoi.addFilesSchema().validate(
        req.body,
      );
      if (error) return Response.error(res, error.details[0].message, 400);

      const doc = await MongoService.findById(StudentDocuments, id);
      if (!doc) return Response.error(res, "Documents not found", 404);
      if (String(doc.student) !== String(req.user.id))
        return Response.error(res, "Forbidden", 403);

      const providedNames = (() => {
        const val = req.body?.fileNames;
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
          return JSON.parse(val);
        } catch (e) {
          return [];
        }
      })();

      const filesToAdd = value.files.map((u, idx) => ({
        url: u,
        name: providedNames[idx] || "",
      }));
      const updated = await MongoService.updateById(
        StudentDocuments,
        id,
        { $push: { files: { $each: filesToAdd } } },
        { new: true },
      );

      Response.success(res, "Files added", { documents: updated });
    } catch (err) {
      console.error("Add Files Error:", err);
      Response.error(res, "Failed to add files", 500);
    }
  }

  // Delete an individual file by its subdocument id
  async deleteFile(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { docId, fileId } = req.params;

      const doc = await MongoService.findById(StudentDocuments, docId);
      if (!doc) return Response.error(res, "Documents not found", 404);
      if (String(doc.student) !== String(req.user.id))
        return Response.error(res, "Forbidden", 403);

      const updated = await StudentDocuments.findByIdAndUpdate(
        docId,
        { $pull: { files: { _id: fileId } } },
        { new: true },
      );

      Response.success(res, "File removed", { documents: updated });
    } catch (err) {
      console.error("Delete File Error:", err);
      Response.error(res, "Failed to delete file", 500);
    }
  }

  // List current student's document collections (usually one)
  async listMyDocs(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const docs = await MongoService.find(StudentDocuments, {
        student: req.user.id,
      });
      Response.success(res, "Documents retrieved", { documents: docs });
    } catch (err) {
      console.error("List My Docs Error:", err);
      Response.error(res, "Failed to list documents", 500);
    }
  }

  // Get a specific documents collection by id (owner only)
  async getDoc(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { id } = req.params;
      const doc = await MongoService.findById(StudentDocuments, id);
      if (!doc) return Response.error(res, "Documents not found", 404);
      if (String(doc.student) !== String(req.user.id))
        return Response.error(res, "Forbidden", 403);
      Response.success(res, "Documents retrieved", { documents: doc });
    } catch (err) {
      console.error("Get Doc Error:", err);
      Response.error(res, "Failed to fetch documents", 500);
    }
  }
}

export default DocumentsController;
