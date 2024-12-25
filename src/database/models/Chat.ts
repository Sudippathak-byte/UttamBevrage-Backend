import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import User from "./User";

@Table({
  tableName: "chats",
  modelName: "Chat",
  timestamps: true,
})
class Chat extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare senderId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare receiverId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare message: string;
}

export default Chat;
