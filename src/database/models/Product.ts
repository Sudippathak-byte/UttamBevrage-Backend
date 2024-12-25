import {
    Table,
    Column,
    Model,
    DataType,
    AllowNull,
  } from "sequelize-typescript";
  
  @Table({
    tableName: "products",
    modelName: "Product",
    timestamps: true,
  })
  class Product extends Model {
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
    declare productName: string;
  
    @Column({
      type: DataType.TEXT,
    })
    declare productDescription: string;
  
    @Column({
      type: DataType.INTEGER,
    })
    declare productPrice: number;
    @Column({
      type: DataType.INTEGER,
    })
    declare productTotalStockQty: number;
  
    @Column({
      type: DataType.STRING,
    })
    declare productImageUrl: string;
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    declare rating: number;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    declare numReviews: number;
  }
  
  export default Product;
  