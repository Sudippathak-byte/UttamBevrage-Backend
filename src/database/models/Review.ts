import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "reviews",
  modelName: "Review",
  timestamps: true,
})
class Review extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare reviewerName: string;

  @Column({
    type: DataType.STRING,
  })
  declare reviewContent: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  declare rating: number;
}

export default Review;
