import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';
import User from './user.model.js';

const CreditRequest = db.define('CreditRequest', {
    request_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'user_id' } },
    requested_amount: { type: DataTypes.INTEGER, allowNull: false },
    full_filled_amount: { type: DataTypes.INTEGER },
    reason: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
    request_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    response_date: { type: DataTypes.DATE },
    admin_notes: { type: DataTypes.TEXT }
}, {
    tableName: 'credit_requests',
    timestamps: false
});

export default CreditRequest;
