import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';
import User from './user.model.js';

const Document = db.define('Document', {
    document_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'user_id' } },
    title: { type: DataTypes.STRING(100), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    file_size: { type: DataTypes.INTEGER },
    upload_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    document_hash: { type: DataTypes.STRING(64), allowNull: false }
}, {
    tableName: 'documents',
    timestamps: false
});

export default Document;
