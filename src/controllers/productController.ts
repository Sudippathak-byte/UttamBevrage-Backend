import { Request,Response } from 'express'
import Product from '../database/models/Product' 
import { AuthRequest } from '../middleware/authMiddleware'
import User from '../database/models/User'
import Category from '../database/models/Category'


class ProductController{
    async addProduct (req:AuthRequest,res:Response):Promise<void>{
        const userID = req.user?.id
        const {productName,productDescription,productTotalStockQty,productPrice,categoryId} = req.body
        console.log(productName,productDescription,productTotalStockQty,productPrice,categoryId)
        let fileName
        console.log(req.file?.filename)
        if(req.file){
            fileName=req.file?.filename
        }else{
            fileName="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW1yhlTpkCnujnhzP-xioiy9RdDQkKLMnMSg&s"
        }
        if(!productName || !productDescription || !productTotalStockQty || !productPrice || !categoryId){
            res.status(400).json({
                message:"Please fill all fields"
            })
            return
        }
        await Product.create({
            productName,
            productDescription,
            productTotalStockQty,
            productPrice,
            productImageUrl: fileName,
            userId : userID,
            categoryId : categoryId

        })
        res.status(200).json({
            message : "Product added sucessfully"
        })
    }
    async getAllProducts(req:Request,res:Response):Promise<void>{ 
        const data = await Product.findAll(
            {
                include: [ 
                    {
                    model : User,
                    attributes : ['id','username', 'email']
                    },
                    {
                        model : Category,
                        attributes : ['id','categoryName']
                    }
                ]
            }
        )
        res.status(200).json({
            message : "Products fetched sucessfully",
            data
        })
    }
    async getSingleProduct(req:Request,res:Response):Promise<void>{
        const id = req.params.id
        const data = await Product.findAll({
            where : {
                id : id
            },
            include : [
                {
                    model : User,
                    attributes : ['id','username', 'email']
                    },
                    {
                        model : Category,
                        attributes : ['id','categoryName']
                    }
            ]
        })
        if(data.length === 0 ){
            res.status(404).json({
                message : "no product with that id"
            })
        }else{
            res.status(200).json({
                message : "product fetched sucessfully",
                data
            })
        }
    }

    async deleteProduct(req:Request,res:Response):Promise<void>{
        const {id} = req.params
        const data = await Product.findAll({
            where : {
                id : id
            }
        })
        if (data.length > 0 ){
          await  Product.destroy({
                where : {
                    id : id
                    }
            })
            res.status(200).json({
                message : "product deleted sucessfully"
            })
        }else{
            res.status(404).json({
                message : "no product with that id"
            })
        }

    }

 } 

export default new ProductController()