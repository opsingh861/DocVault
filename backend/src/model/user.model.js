import { DataTypes } from 'sequelize';
import { db } from '../utils/database.js';

const User = db.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name : { type: DataTypes.STRING(50), allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password_hashed: { type: DataTypes.STRING(128), allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
    creation_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'users',
    timestamps: false
});

export default User;
