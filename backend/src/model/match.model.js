import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';
import Document from './document.model.js';

const MatchResult = db.define('MatchResult', {
    match_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Document, key: 'document_id' }
    },
    matched_document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Document, key: 'document_id' }
    },
    similarity_score: { type: DataTypes.FLOAT, allowNull: false },
    match_type: { type: DataTypes.STRING, allowNull: false },
    matched_document_title: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'match_results',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['document_id', 'matched_document_id']
        }
    ]
});

export default MatchResult;
