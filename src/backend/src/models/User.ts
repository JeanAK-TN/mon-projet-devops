import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreation = Optional<UserAttributes, 'id' | 'role'>;

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: number;
  declare email: string;
  declare password: string;
  declare name: string;
  declare role: 'user' | 'admin';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }

  public toJSON(): Omit<UserAttributes, 'password'> {
    const values: any = { ...this.get() };
    delete values.password;
    return values;
  }
}

export default function init(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
      hooks: {
        beforeCreate: async (user: User) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user: User) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );
  return User;
}
