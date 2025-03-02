import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';
import Document from './document.model.js';

const DocumentMetadata = db.define('DocumentMetadata', {
    metadata_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    document_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Document, key: 'document_id' } },
    keyword: { type: DataTypes.STRING(50), allowNull: false },
    frequency: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'document_metadata',
    timestamps: false
});

export default DocumentMetadata;
