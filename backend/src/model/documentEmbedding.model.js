import { DataTypes } from "sequelize";
import { db } from "../utils/database.js";
import Document from "./document.model.js";

const DocumentEmbedding = db.define(
  "DocumentEmbedding",
  {
    embedding_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Document, key: "document_id" },
      onDelete: "CASCADE",
    },
    embedding: { type: DataTypes.JSON, allowNull: false }, // Store embeddings as JSON array
  },
  {
    tableName: "document_embeddings",
    timestamps: false,
  }
);

export default DocumentEmbedding;