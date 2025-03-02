import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';
import ScanHistory from './scan.model.js';
import Document from './document.model.js';

const MatchResult = db.define('MatchResult', {
    match_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    scan_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: ScanHistory, key: 'scan_id' } },
    matched_document_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Document, key: 'document_id' } }
}, {
    tableName: 'match_results',
    timestamps: false
});

export default MatchResult;
