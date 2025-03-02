import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';
import User from './user.model.js';
import Document from './document.model.js';

const ScanHistory = db.define('ScanHistory', {
    scan_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'user_id' } },
    document_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Document, key: 'document_id' } },
    scan_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'scan_history',
    timestamps: false
});

export default ScanHistory;
