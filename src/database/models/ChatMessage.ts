import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "chatMessages",
  timestamps: true,
})
class ChatMessage extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
  })
  declare message: string;

  @Column({
    type: DataType.STRING,
  })
  declare role: string; // "customer" or "admin"
}

export default ChatMessage;
