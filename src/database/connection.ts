import {Sequelize} from 'sequelize-typescript'
import User from './models/User'
import Product from './models/Product'
import Category from './models/Category'
import Cart from './models/Cart'
import Order from './models/Order'
import OrderDetail from './models/OrderDetails'
import Payment from './models/Payment'

const sequelize = new Sequelize ({
    database : process.env.DB_NAME,
    dialect : 'mysql',
    username : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    models : [__dirname + "/models"]
})

sequelize.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
});


sequelize.sync({force : false, alter:false}).then(()=>{
    console.log('Database synced successfully.');
})


//relationship
User.hasMany(Product, {foreignKey : 'userId'})
Product.belongsTo(User, {foreignKey: 'userId'})

Product.belongsTo(Category,{foreignKey: 'categoryId'})
Category.hasOne(Product,{foreignKey : 'categoryId'})


//product-cart relation
User.hasMany(Cart,{foreignKey : 'userId'})
Cart.belongsTo(User,{foreignKey :'userId'})

//user cart relation
Product.hasMany(Cart,{foreignKey:'productId'})
Cart.belongsTo(Product,{foreignKey:'productId'})

//order-orderdetails relation
Order.hasMany(OrderDetail,{foreignKey:'orderId'})
OrderDetail.belongsTo(Order,{foreignKey:'orderId'})

// orderdetail-product relation 
Product.hasMany(OrderDetail,{foreignKey:'productId'})
OrderDetail.belongsTo(Product,{foreignKey:'productId'})

//order-payment relation
Payment.hasOne(Order,{foreignKey:'paymentId'})
Order.belongsTo(Payment,{foreignKey:'paymentId'})

//order-user relation
User.hasMany(Order,{foreignKey : 'userId'})
Order.belongsTo(User,{foreignKey : 'userId'})

export default sequelize
