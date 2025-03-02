import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';
import User from './user.model.js';

const Credit = db.define('Credit', {
    credit_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'user_id' } },
    current_balance: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 },
    limit_credit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 }
}, {
    tableName: 'credits',
    timestamps: false
});

export default Credit;
